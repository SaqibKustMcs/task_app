import { Model } from 'mongoose';
import { UserDocument } from '../schema/user/user.schema';
import { NotificationDocument } from '../schema/notification/notification.schema';
import { FirebaseService } from './firebase.service';
import { NotificationResponseDto } from './dto/notification.dto';
export declare class NotificationService {
    private readonly notificationModel;
    private readonly userModel;
    private readonly firebaseService;
    constructor(notificationModel: Model<NotificationDocument>, userModel: Model<UserDocument>, firebaseService: FirebaseService);
    notifyTaskAssigned(params: {
        assigneeUserId: string;
        taskId: string;
        taskTitle: string;
        assignedByUserId: string | null;
        assignedByName?: string;
    }): Promise<void>;
    listForUser(userId: string, limit?: number): Promise<{
        data: NotificationResponseDto[];
        total: number;
        unreadCount: number;
    }>;
    markRead(userId: string, notificationId: string): Promise<{
        success: boolean;
    }>;
    markAllRead(userId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    sendTestPush(userId: string): Promise<{
        success: boolean;
        sent: number;
        failed: number;
    }>;
}
