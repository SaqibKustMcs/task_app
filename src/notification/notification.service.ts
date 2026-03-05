import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user/user.schema';
import { Notification, NotificationDocument } from '../schema/notification/notification.schema';
import { FirebaseService } from './firebase.service';
import { NotificationResponseDto } from './dto/notification.dto';

/** Extract FCM token string from a stored token object (Mongoose may use .get or plain .token). */
function getTokenString(t: any): string | null {
  if (!t) return null;
  const token = typeof t === 'string' ? t : (t.token ?? t.get?.('token'));
  if (typeof token !== 'string') return null;
  const s = token.trim();
  return s.length > 0 ? s : null;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly firebaseService: FirebaseService,
  ) {}

  /** When manager assigns a task to a user: create in-app notification and send push to assignee's devices. */
  async notifyTaskAssigned(params: {
    assigneeUserId: string;
    taskId: string;
    taskTitle: string;
    assignedByUserId: string | null;
    assignedByName?: string;
  }): Promise<void> {
    const { assigneeUserId, taskId, taskTitle, assignedByUserId, assignedByName } = params;
    const title = 'New task assigned';
    const body = assignedByName
      ? `${assignedByName} assigned you: ${taskTitle}`
      : `You were assigned: ${taskTitle}`;

    const doc = await this.notificationModel.create({
      userId: assigneeUserId,
      type: 'task_assigned',
      title,
      body,
      taskId,
      assignedByUserId: assignedByUserId ?? null,
      read: false,
    });

    const user = await this.userModel.findOne({ id: assigneeUserId }).exec();
    if (!user) return;
    const rawList = (user as any).fcmTokens ?? [];
    const validTokens: string[] = [];
    rawList.forEach((t: any) => {
      const s = getTokenString(t);
      if (s) validTokens.push(s);
    });

    if (validTokens.length === 0) return;

    const result = await this.firebaseService.sendToTokens(validTokens, {
      title,
      body,
      data: { type: 'task_assigned', taskId, notificationId: doc.id },
    });

    if (result.failureCount > 0 && result.failedTokenIndices.length > 0) {
      const toRemove = new Set(result.failedTokenIndices.map((i) => validTokens[i]));
      const updatedList = rawList
        .filter((t: any) => {
          const s = getTokenString(t);
          return s && !toRemove.has(s);
        })
        .map((t: any) => ({
          token: getTokenString(t)!,
          appId: t.appId ?? t.get?.('appId') ?? null,
          deviceId: t.deviceId ?? t.get?.('deviceId') ?? null,
          updatedAt: t.updatedAt ?? new Date(),
        }));
      await this.userModel.updateOne({ id: assigneeUserId }, { $set: { fcmTokens: updatedList } }).exec();
    }
  }

  /** List notifications for the current user (newest first). */
  async listForUser(userId: string, limit = 50): Promise<{
    data: NotificationResponseDto[];
    total: number;
    unreadCount: number;
  }> {
    const [docs, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments({ userId: userId }).exec(),
      this.notificationModel.countDocuments({ userId: userId, read: false }).exec(),
    ]);
    const data = (docs as any[]).map((d) => ({
      id: d.id,
      userId: d.userId,
      type: d.type,
      title: d.title,
      body: d.body,
      taskId: d.taskId ?? null,
      assignedByUserId: d.assignedByUserId ?? null,
      read: d.read ?? false,
      createdAt: d.createdAt,
    }));
    return { data, total, unreadCount };
  }

  /** Mark a notification as read. */
  async markRead(userId: string, notificationId: string): Promise<{ success: boolean }> {
    const res = await this.notificationModel
      .updateOne({ id: notificationId, userId }, { $set: { read: true } })
      .exec();
    if (res.matchedCount === 0) throw new NotFoundException('Notification not found');
    return { success: true };
  }

  /** Mark all notifications as read for the user. */
  async markAllRead(userId: string): Promise<{ success: boolean; count: number }> {
    const res = await this.notificationModel
      .updateMany({ userId, read: false }, { $set: { read: true } })
      .exec();
    return { success: true, count: res.modifiedCount };
  }

  /** Send a test push notification to the current user's devices (no in-app notification). */
  async sendTestPush(userId: string): Promise<{ success: boolean; sent: number; failed: number }> {
    const user = await this.userModel.findOne({ id: userId }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const rawList = (user as any).fcmTokens ?? [];
    const tokens: string[] = [];
    rawList.forEach((t: any) => {
      const s = getTokenString(t);
      if (s) tokens.push(s);
    });
    if (tokens.length === 0) {
      return { success: false, sent: 0, failed: 0 };
    }
    const result = await this.firebaseService.sendToTokens(tokens, {
      title: 'Test push notification',
      body: 'If you see this, FCM is wired correctly.',
      data: { type: 'test_push' },
    });
    return { success: result.failureCount === 0, sent: result.successCount, failed: result.failureCount };
  }
}
