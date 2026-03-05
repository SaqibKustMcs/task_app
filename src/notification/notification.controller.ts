import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { UserDocument } from '../schema/user/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { NotificationListResponseDto } from './dto/notification.dto';

export type AuthRequest = ExpressRequest & { user: UserDocument };

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List in-app notifications for current user' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of notifications', type: NotificationListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Request() req: AuthRequest, @Query('limit') limit?: string) {
    const userId = req.user.id;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : 50;
    return this.notificationService.listForUser(userId, limitNum);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All marked as read' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markAllRead(@Request() req: AuthRequest) {
    return this.notificationService.markAllRead(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async markRead(@Request() req: AuthRequest, @Param('id') id: string) {
    return this.notificationService.markRead(req.user.id, id);
  }

  @Post('test-push')
  @ApiOperation({ summary: 'Send a test push notification to current user devices' })
  @ApiResponse({ status: 200, description: 'Test push attempt result' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTestPush(@Request() req: AuthRequest) {
    return this.notificationService.sendTestPush(req.user.id);
  }
}
