import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ enum: ['manager', 'employee'], description: 'User role in task hierarchy' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Department ID (for manager/employee)' })
  @IsOptional()
  @IsString()
  departmentId?: string;
}

export class SignupResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiProperty({ description: 'Verify email with OTP (default: 123456)' })
  emailVerified: boolean;
  @ApiProperty()
  createdAt: Date;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'OTP sent to email (default: 123456)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  otp: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  name: string;
  @ApiPropertyOptional({ description: 'manager | employee' })
  role?: string;
  @ApiPropertyOptional()
  departmentId?: string | null;
  @ApiProperty()
  emailVerified: boolean;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
}

export class VerifyEmailResponseDto {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: UserResponseDto, description: 'User model (included when verified)' })
  user: UserResponseDto;
  @ApiProperty({ description: 'JWT auth token for authenticated requests' })
  authToken: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  success: boolean;
  @ApiProperty()
  message: string;
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
  @ApiProperty({ description: 'JWT auth token for authenticated requests' })
  authToken: string;
}
