import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user/user.schema';
import { Notification, NotificationDocument } from '../schema/notification/notification.schema';
import { FirebaseService } from './firebase.service';
import { NotificationResponseDto } from './dto/notification.dto';

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

    const user = await this.userModel.findOne({ id: assigneeUserId }).lean().exec();
    const tokens: string[] = (user as any)?.fcmTokens?.map((t: { token: string }) => t.token) ?? [];
    const validTokens = tokens.filter((t: string) => t && t.trim().length > 0);
    if (validTokens.length > 0) {
      await this.firebaseService.sendToTokens(validTokens, {
        title,
        body,
        data: { type: 'task_assigned', taskId, notificationId: doc.id },
      });
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
}
