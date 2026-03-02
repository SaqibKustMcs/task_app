export declare class SignupDto {
    email: string;
    password: string;
    name: string;
    role?: string;
    departmentId?: string;
    fcmToken?: string;
    appId?: string;
    deviceId?: string;
}
export declare class SignupResponseDto {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    createdAt: Date;
}
export declare class VerifyEmailDto {
    email: string;
    otp: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role?: string;
    departmentId?: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VerifyEmailResponseDto {
    success: boolean;
    message: string;
    user: UserResponseDto;
    authToken: string;
}
export declare class LoginDto {
    email: string;
    password: string;
    fcmToken?: string;
    appId?: string;
    deviceId?: string;
}
export declare class LoginResponseDto {
    success: boolean;
    message: string;
    user: UserResponseDto;
    authToken: string;
}
export declare class RegisterFcmDto {
    fcmToken: string;
    appId?: string;
    deviceId?: string;
}
