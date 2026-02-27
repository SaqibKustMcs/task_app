"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcryptjs"));
const user_schema_1 = require("../schema/user/user.schema");
const DEFAULT_OTP = '123456';
const OTP_EXPIRY_MINUTES = 15;
let AuthService = class AuthService {
    userModel;
    jwtService;
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    toUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            departmentId: user.departmentId ?? null,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
    createAuthToken(user) {
        return this.jwtService.sign({ sub: user.id, email: user.email }, { expiresIn: 7 * 24 * 60 * 60 });
    }
    async signup(dto) {
        const existing = await this.userModel.findOne({ email: dto.email }).exec();
        if (existing) {
            throw new common_1.ConflictException('User with this email already exists');
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
        });
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
        };
    }
    async verifyEmail(dto) {
        const user = await this.userModel.findOne({ email: dto.email }).exec();
        if (!user) {
            throw new common_1.BadRequestException('User not found');
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
            throw new common_1.BadRequestException('OTP expired. Request a new one.');
        }
        if (user.otp !== dto.otp) {
            throw new common_1.BadRequestException('Invalid OTP');
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
    async login(dto) {
        const user = await this.userModel.findOne({ email: dto.email }).exec();
        if (!user) {
            throw new common_1.BadRequestException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.BadRequestException('Invalid email or password');
        }
        if (!user.emailVerified) {
            throw new common_1.BadRequestException('Please verify your email before logging in');
        }
        return {
            success: true,
            message: 'Login successful',
            user: this.toUserResponse(user),
            authToken: this.createAuthToken(user),
        };
    }
    async getUsers() {
        const users = await this.userModel.find({}).select('id name email').lean().exec();
        return users.map((u) => ({
            id: u.id,
            name: u.name ?? '',
            email: u.email ?? '',
        }));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map