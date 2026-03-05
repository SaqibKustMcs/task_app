import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({ description: 'Device identifier whose FCM tokens should be cleared' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  deviceId?: string;
}

