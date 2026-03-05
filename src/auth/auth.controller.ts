import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { UserDocument } from '../schema/user/user.schema';
import { AuthService } from './auth.service';
import {
  SignupDto,
  SignupResponseDto,
  VerifyEmailDto,
  VerifyEmailResponseDto,
  LoginDto,
  LoginResponseDto,
  UserResponseDto,
  RegisterFcmDto,
} from './dto/signup.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export type AuthRequest = ExpressRequest & { user: UserDocument };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User created', type: SignupResponseDto })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email with OTP (default OTP: 123456)' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified', type: VerifyEmailResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid credentials or email not verified' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get logged-in user' })
  @ApiResponse({ status: 200, description: 'Current user', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getLoggedInUser(@Request() req: AuthRequest) {
    return this.authService.toUserResponse(req.user);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List users (for task assignee picker)' })
  @ApiResponse({ status: 200, description: 'List of users (id, name, email)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUsers() {
    return this.authService.getUsers();
  }

  @Post('fcm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Register or refresh FCM token (multiple devices/apps)' })
  @ApiBody({ type: RegisterFcmDto })
  @ApiResponse({ status: 200, description: 'FCM token registered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  registerFcm(@Request() req: AuthRequest, @Body() dto: RegisterFcmDto) {
    return this.authService.registerFcm(req.user.id, dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and clear FCM tokens for this device' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'Logged out and tokens cleared' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Request() req: AuthRequest, @Body() dto: LogoutDto) {
    return this.authService.logout(req.user.id, dto);
  }
}
