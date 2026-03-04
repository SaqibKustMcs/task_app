"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../schema/user/user.schema");
const notification_schema_1 = require("../schema/notification/notification.schema");
const firebase_service_1 = require("./firebase.service");
function getTokenString(t) {
    if (!t)
        return null;
    const token = typeof t === 'string' ? t : (t.token ?? t.get?.('token'));
    if (typeof token !== 'string')
        return null;
    const s = token.trim();
    return s.length > 0 ? s : null;
}
let NotificationService = class NotificationService {
    notificationModel;
    userModel;
    firebaseService;
    constructor(notificationModel, userModel, firebaseService) {
        this.notificationModel = notificationModel;
        this.userModel = userModel;
        this.firebaseService = firebaseService;
    }
    async notifyTaskAssigned(params) {
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
        if (!user)
            return;
        const rawList = user.fcmTokens ?? [];
        const validTokens = [];
        rawList.forEach((t) => {
            const s = getTokenString(t);
            if (s)
                validTokens.push(s);
        });
        if (validTokens.length === 0)
            return;
        const result = await this.firebaseService.sendToTokens(validTokens, {
            title,
            body,
            data: { type: 'task_assigned', taskId, notificationId: doc.id },
        });
        if (result.failureCount > 0 && result.failedTokenIndices.length > 0) {
            const toRemove = new Set(result.failedTokenIndices.map((i) => validTokens[i]));
            const updatedList = rawList
                .filter((t) => {
                const s = getTokenString(t);
                return s && !toRemove.has(s);
            })
                .map((t) => ({
                token: getTokenString(t),
                appId: t.appId ?? t.get?.('appId') ?? null,
                deviceId: t.deviceId ?? t.get?.('deviceId') ?? null,
                updatedAt: t.updatedAt ?? new Date(),
            }));
            await this.userModel.updateOne({ id: assigneeUserId }, { $set: { fcmTokens: updatedList } }).exec();
        }
    }
    async listForUser(userId, limit = 50) {
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
        const data = docs.map((d) => ({
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
    async markRead(userId, notificationId) {
        const res = await this.notificationModel
            .updateOne({ id: notificationId, userId }, { $set: { read: true } })
            .exec();
        if (res.matchedCount === 0)
            throw new common_1.NotFoundException('Notification not found');
        return { success: true };
    }
    async markAllRead(userId) {
        const res = await this.notificationModel
            .updateMany({ userId, read: false }, { $set: { read: true } })
            .exec();
        return { success: true, count: res.modifiedCount };
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_schema_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        firebase_service_1.FirebaseService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map