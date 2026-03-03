import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  title: string;
  @ApiProperty()
  body: string;
  @ApiPropertyOptional()
  taskId?: string | null;
  @ApiPropertyOptional()
  assignedByUserId?: string | null;
  @ApiProperty()
  read: boolean;
  @ApiProperty()
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data: NotificationResponseDto[];
  @ApiProperty()
  total: number;
  @ApiProperty()
  unreadCount: number;
}
