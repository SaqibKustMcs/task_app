import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schema/user/user.schema';
import {
  SignupDto,
  SignupResponseDto,
  UserResponseDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
  LoginDto,
  LoginResponseDto,
  RegisterFcmDto,
} from './dto/signup.dto';

const DEFAULT_OTP = '123456';
const OTP_EXPIRY_MINUTES = 15;
const MAX_FCM_TOKENS = 20;

/** Upsert FCM token into user's list (by token string); cap at MAX_FCM_TOKENS. */
function upsertFcmToken(
  tokens: { token: string; appId?: string | null; deviceId?: string | null; updatedAt: Date }[],
  token: string,
  appId?: string | null,
  deviceId?: string | null,
): { token: string; appId?: string | null; deviceId?: string | null; updatedAt: Date }[] {
  const next = { token, appId: appId ?? null, deviceId: deviceId ?? null, updatedAt: new Date() };
  const filtered = tokens.filter((t) => t.token !== token);
  const updated = [next, ...filtered].slice(0, MAX_FCM_TOKENS);
  return updated;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  toUserResponse(user: UserDocument): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: (user as any).role,
      departmentId: (user as any).departmentId ?? null,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private createAuthToken(user: UserDocument): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: 7 * 24 * 60 * 60 }, // 7 days
    );
  }

  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const user = await this.userModel.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role === 'manager' ? 'manager' : 'employee',
      departmentId: dto.departmentId?.trim() || null,
      emailVerified: false,
      otp: DEFAULT_OTP,
      otpExpiresAt,
      fcmTokens:
        dto.fcmToken?.trim() ?
          upsertFcmToken([], dto.fcmToken.trim(), dto.appId?.trim(), dto.deviceId?.trim())
        : [],
    });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.emailVerified) {
      return {
        success: true,
        message: 'Email already verified',
        user: this.toUserResponse(user),
        authToken: this.createAuthToken(user),
      };
    }
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP expired. Request a new one.');
    }
    if (user.otp !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }
    user.emailVerified = true;
    user.otp = '';
    user.otpExpiresAt = null;
    await user.save();
    return {
      success: true,
      message: 'Email verified successfully',
      user: this.toUserResponse(user),
      authToken: this.createAuthToken(user),
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw new BadRequestException('Please verify your email before logging in');
    }

    if (dto.fcmToken?.trim()) {
      const tokens = (user as any).fcmTokens ?? [];
      user.fcmTokens = upsertFcmToken(
        tokens,
        dto.fcmToken.trim(),
        dto.appId?.trim(),
        dto.deviceId?.trim(),
      );
      await user.save();
    }

    return {
      success: true,
      message: 'Login successful',
      user: this.toUserResponse(user),
      authToken: this.createAuthToken(user),
    };
  }

  /** List users for assignee picker (id, name, email). Requires auth. */
  async getUsers(): Promise<{ id: string; name: string; email: string }[]> {
    const users = await this.userModel.find({}).select('id name email').lean().exec();
    return (users as { id: string; name: string; email: string }[]).map((u) => ({
      id: u.id,
      name: u.name ?? '',
      email: u.email ?? '',
    }));
  }

  /** Register or update FCM token for the current user (multiple devices/apps). */
  async registerFcm(userId: string, dto: RegisterFcmDto): Promise<{ success: boolean; message: string }> {
    const user = await this.userModel.findOne({ id: userId }).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const tokens = (user as any).fcmTokens ?? [];
    user.fcmTokens = upsertFcmToken(
      tokens,
      dto.fcmToken.trim(),
      dto.appId?.trim(),
      dto.deviceId?.trim(),
    );
    await user.save();
    return { success: true, message: 'FCM token registered' };
  }
}
