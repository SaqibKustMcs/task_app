import { Document } from 'mongoose';
export interface User extends Document {
    id: string;
    email: string;
    password: string;
    name: string;
    role: string;
    departmentId: string | null;
    emailVerified: boolean;
    otp: string;
    otpExpiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
