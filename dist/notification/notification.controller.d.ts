import { Request as ExpressRequest } from 'express';
import { UserDocument } from '../schema/user/user.schema';
import { NotificationService } from './notification.service';
export type AuthRequest = ExpressRequest & {
    user: UserDocument;
};
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    list(req: AuthRequest, limit?: string): Promise<{
        data: import("./dto/notification.dto").NotificationResponseDto[];
        total: number;
        unreadCount: number;
    }>;
    markAllRead(req: AuthRequest): Promise<{
        success: boolean;
        count: number;
    }>;
    markRead(req: AuthRequest, id: string): Promise<{
        success: boolean;
    }>;
    sendTestPush(req: AuthRequest): Promise<{
        success: boolean;
        sent: number;
        failed: number;
    }>;
}
