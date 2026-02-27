import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../../schema/user/user.schema';
export declare class JwtAuthGuard implements CanActivate {
    private readonly reflector;
    private readonly jwtService;
    private readonly userModel;
    constructor(reflector: Reflector, jwtService: JwtService, userModel: Model<UserDocument>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
