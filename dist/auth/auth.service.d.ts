import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../schema/user/user.schema';
import { SignupDto, SignupResponseDto, UserResponseDto, VerifyEmailDto, VerifyEmailResponseDto, LoginDto, LoginResponseDto, RegisterFcmDto } from './dto/signup.dto';
export declare class AuthService {
    private readonly userModel;
    private readonly jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    toUserResponse(user: UserDocument): UserResponseDto;
    private createAuthToken;
    signup(dto: SignupDto): Promise<SignupResponseDto>;
    verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto>;
    login(dto: LoginDto): Promise<LoginResponseDto>;
    getUsers(): Promise<{
        id: string;
        name: string;
        email: string;
    }[]>;
    registerFcm(userId: string, dto: RegisterFcmDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
