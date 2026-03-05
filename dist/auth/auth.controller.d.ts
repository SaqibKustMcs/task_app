import { Request as ExpressRequest } from 'express';
import { UserDocument } from '../schema/user/user.schema';
import { AuthService } from './auth.service';
import { SignupDto, SignupResponseDto, VerifyEmailDto, VerifyEmailResponseDto, LoginDto, LoginResponseDto, UserResponseDto, RegisterFcmDto } from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';
export type AuthRequest = ExpressRequest & {
    user: UserDocument;
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<SignupResponseDto>;
    verifyEmail(dto: VerifyEmailDto): Promise<VerifyEmailResponseDto>;
    login(dto: LoginDto): Promise<LoginResponseDto>;
    getLoggedInUser(req: AuthRequest): UserResponseDto;
    getUsers(): Promise<{
        id: string;
        name: string;
        email: string;
    }[]>;
    registerFcm(req: AuthRequest, dto: RegisterFcmDto): Promise<{
        success: boolean;
        message: string;
    }>;
    logout(req: AuthRequest, dto: LogoutDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
