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
exports.TaskService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("../schema/task/task.schema");
const user_schema_1 = require("../schema/user/user.schema");
const enums_1 = require("../enums");
const notification_service_1 = require("../notification/notification.service");
let TaskService = class TaskService {
    taskModel;
    userModel;
    notificationService;
    constructor(taskModel, userModel, notificationService) {
        this.taskModel = taskModel;
        this.userModel = userModel;
        this.notificationService = notificationService;
    }
    toResponse(task) {
        const status = task.status ?? (task.isCompleted ? 'completed' : 'pending');
        return {
            id: task.id,
            userId: task.userId?.toString?.() ?? task.userId ?? '',
            assigneeId: task.assigneeId ?? null,
            assignedBy: task.assignedBy ?? null,
            assignedTo: task.assignedTo ?? null,
            departmentId: task.departmentId ?? null,
            title: task.title ?? '',
            description: task.description ?? '',
            status,
            dueDate: task.dueDate,
            priority: task.priority ?? '',
            category: task.category ?? '',
            reminder: task.reminder ?? null,
            attachmentUrl: task.attachmentUrl ?? '',
            isDeleted: task.isDeleted ?? false,
            isCompleted: task.isCompleted ?? false,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };
    }
    async createTask(dto, userId, userRole) {
        const taskData = {
            userId: userId ?? '',
            title: dto.title.trim(),
            dueDate: new Date(dto.dueDate),
            priority: dto.priority,
            category: dto.category?.trim() ?? '',
            status: enums_1.TaskStatus.PENDING,
        };
        if (dto.description != null)
            taskData.description = dto.description;
        if (dto.reminder != null)
            taskData.reminder = new Date(dto.reminder);
        if (dto.attachmentUrl != null)
            taskData.attachmentUrl = dto.attachmentUrl;
        if (dto.assigneeId != null && dto.assigneeId.trim() !== '')
            taskData.assigneeId = dto.assigneeId.trim();
        if (userRole === 'manager') {
            taskData.assignedBy = userId ?? null;
            taskData.departmentId = dto.departmentId?.trim() || null;
            const assignTo = dto.assignedTo?.trim() || dto.assigneeId?.trim();
            if (assignTo) {
                const employee = await this.userModel.findOne({ id: assignTo }).lean().exec();
                if (!employee)
                    throw new common_1.NotFoundException('Assigned employee not found');
                if (employee.role !== 'employee') {
                    throw new common_1.BadRequestException('Can only assign tasks to employees');
                }
                const empDept = employee.departmentId ?? null;
                const taskDept = taskData.departmentId ?? (await this.userModel.findOne({ id: userId }).lean().then((u) => u?.departmentId ?? null));
                if (empDept && taskDept && empDept !== taskDept) {
                    throw new common_1.ForbiddenException('Employee must be in the same department');
                }
                taskData.assignedTo = assignTo;
                taskData.departmentId = taskData.departmentId ?? empDept;
            }
        }
        const doc = await new this.taskModel(taskData).save();
        const data = this.toResponse(doc.toObject?.() ?? doc);
        const assigneeId = taskData.assigneeId ?? taskData.assignedTo;
        if (assigneeId && userRole === 'manager' && userId) {
            const manager = await this.userModel.findOne({ id: userId }).lean().exec();
            this.notificationService.notifyTaskAssigned({
                assigneeUserId: assigneeId,
                taskId: doc.id,
                taskTitle: taskData.title,
                assignedByUserId: userId,
                assignedByName: manager?.name ?? undefined,
            }).catch((e) => {
                console.warn('[Notifications] notifyTaskAssigned failed (createTask):', e);
            });
        }
        return { success: true, message: 'Task created successfully', data };
    }
    async updateTaskStatus(taskId, dto, userId) {
        if (!taskId?.trim())
            throw new common_1.BadRequestException('Task id is required');
        const doc = await this.taskModel.findOne({ id: taskId, isDeleted: { $ne: true } }).exec();
        if (!doc)
            throw new common_1.NotFoundException('Task not found');
        const assignedTo = doc.assignedTo ?? doc.assigneeId;
        if (assignedTo !== userId) {
            throw new common_1.ForbiddenException('Only the assigned employee can update task status');
        }
        const update = {
            status: dto.status,
            isCompleted: dto.status === enums_1.TaskStatus.COMPLETED,
            updatedAt: new Date(),
        };
        const updated = await this.taskModel.findOneAndUpdate({ id: taskId }, { $set: update }, { new: true }).exec();
        const data = this.toResponse(updated?.toObject?.() ?? updated);
        return { success: true, message: 'Task status updated', data };
    }
    async getAllTasks(query, rawIsCompleted, rawUnassigned) {
        const offset = Math.max(0, Number(query.offset ?? 0) || 0);
        const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10) || 10));
        const filter = { isDeleted: { $ne: true } };
        if (query.userId)
            filter.userId = query.userId;
        if (query.assigneeId)
            filter.assigneeId = query.assigneeId;
        if (query.departmentId)
            filter.departmentId = query.departmentId;
        if (query.status)
            filter.status = query.status;
        const wantUnassigned = (rawUnassigned !== undefined && String(rawUnassigned).toLowerCase() === 'true') ||
            query.unassigned === true;
        if (wantUnassigned) {
            filter.$or = [
                { assigneeId: null },
                { assigneeId: '' },
                { assigneeId: { $exists: false } },
            ];
        }
        if (query.category)
            filter.category = query.category;
        if (query.priority)
            filter.priority = query.priority;
        if (rawIsCompleted !== undefined && rawIsCompleted !== '') {
            const wantCompleted = String(rawIsCompleted).toLowerCase() === 'true';
            filter.isCompleted = { $eq: wantCompleted };
        }
        else if (query.isCompleted === false) {
            filter.isCompleted = { $eq: false };
        }
        else if (query.isCompleted === true) {
            filter.isCompleted = { $eq: true };
        }
        let sort = { createdAt: -1 };
        const sortBy = query.sortBy ?? 'createdAt';
        const sortOrder = query.sortOrder ?? 'desc';
        const dir = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'dueDate')
            sort = { dueDate: dir };
        else if (sortBy === 'priority')
            sort = { priority: dir };
        else
            sort = { createdAt: dir };
        const [total, docs] = await Promise.all([
            this.taskModel.countDocuments(filter).exec(),
            this.taskModel.find(filter).sort(sort).skip(offset).limit(limit).exec(),
        ]);
        const tasks = docs.map((d) => this.toResponse(d.toObject?.() ?? d));
        return {
            success: true,
            message: 'Tasks retrieved successfully',
            data: { tasks, total, offset, limit },
        };
    }
    async getDashboardStats(departmentId) {
        const match = { isDeleted: { $ne: true } };
        if (departmentId)
            match.departmentId = departmentId;
        const byStatus = await this.taskModel
            .aggregate([
            { $match: match },
            { $group: { _id: { $ifNull: ['$status', 'pending'] }, count: { $sum: 1 } } },
        ])
            .exec();
        const total = byStatus.reduce((s, x) => s + x.count, 0);
        const data = {
            byStatus: {
                pending: byStatus.find((x) => x._id === 'pending')?.count ?? 0,
                in_progress: byStatus.find((x) => x._id === 'in_progress')?.count ?? 0,
                completed: byStatus.find((x) => x._id === 'completed')?.count ?? 0,
            },
            total,
        };
        return { success: true, message: 'Dashboard stats', data };
    }
    async getTaskById(taskId) {
        if (!taskId || String(taskId).trim() === '') {
            throw new common_1.BadRequestException('Task id is required');
        }
        const doc = await this.taskModel
            .findOne({ id: taskId, isDeleted: { $ne: true } })
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException('Task not found');
        }
        const data = this.toResponse(doc.toObject?.() ?? doc);
        return { success: true, message: 'Task retrieved successfully', data };
    }
    async updateTask(taskId, dto, currentUserId) {
        if (!taskId || String(taskId).trim() === '') {
            throw new common_1.BadRequestException('Task id is required');
        }
        const doc = await this.taskModel
            .findOne({ id: taskId, isDeleted: { $ne: true } })
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException('Task not found');
        }
        const update = {};
        if (dto.title !== undefined)
            update.title = dto.title.trim();
        if (dto.description !== undefined)
            update.description = dto.description;
        if (dto.dueDate !== undefined)
            update.dueDate = new Date(dto.dueDate);
        if (dto.priority !== undefined)
            update.priority = dto.priority;
        if (dto.category !== undefined)
            update.category = dto.category.trim();
        if (dto.reminder !== undefined)
            update.reminder = dto.reminder ? new Date(dto.reminder) : null;
        if (dto.attachmentUrl !== undefined)
            update.attachmentUrl = dto.attachmentUrl;
        if (typeof dto.isCompleted === 'boolean')
            update.isCompleted = dto.isCompleted;
        if (dto.assigneeId !== undefined)
            update.assigneeId = dto.assigneeId?.trim() === '' ? null : dto.assigneeId?.trim() ?? null;
        if (dto.status !== undefined) {
            update.status = dto.status;
            update.isCompleted = dto.status === 'completed';
        }
        if (Object.keys(update).length === 0) {
            const data = this.toResponse(doc.toObject?.() ?? doc);
            return { success: true, message: 'Task unchanged', data };
        }
        const previousAssignee = doc.assigneeId ?? doc.assignedTo ?? null;
        const newAssignee = update.assigneeId !== undefined
            ? (update.assigneeId?.trim() === '' ? null : update.assigneeId?.trim() ?? null)
            : previousAssignee;
        update.updatedAt = new Date();
        const updated = await this.taskModel
            .findOneAndUpdate({ id: taskId }, { $set: update }, { new: true })
            .exec();
        const data = this.toResponse(updated?.toObject?.() ?? updated);
        if (newAssignee && newAssignee !== previousAssignee) {
            const manager = await this.userModel
                .findOne({ id: currentUserId ?? doc.userId })
                .lean()
                .exec();
            this.notificationService.notifyTaskAssigned({
                assigneeUserId: newAssignee,
                taskId,
                taskTitle: updated?.title ?? '',
                assignedByUserId: currentUserId ?? doc.userId ?? null,
                assignedByName: manager?.name ?? undefined,
            }).catch((e) => {
                console.warn('[Notifications] notifyTaskAssigned failed (updateTask):', e);
            });
        }
        return { success: true, message: 'Task updated successfully', data };
    }
    async deleteTask(taskId, userId) {
        if (!taskId || String(taskId).trim() === '') {
            throw new common_1.BadRequestException('Task id is required');
        }
        const doc = await this.taskModel
            .findOne({ id: taskId, isDeleted: { $ne: true } })
            .exec();
        if (!doc) {
            throw new common_1.NotFoundException('Task not found');
        }
        const taskUserId = doc.userId?.toString?.() ?? doc.userId ?? '';
        if (taskUserId && userId && taskUserId !== userId) {
            throw new common_1.ForbiddenException('Only the task owner can delete this task');
        }
        await this.taskModel
            .findOneAndUpdate({ id: taskId }, { $set: { isDeleted: true, updatedAt: new Date() } }, { new: true })
            .exec();
        return { success: true, message: 'Task deleted successfully' };
    }
};
exports.TaskService = TaskService;
exports.TaskService = TaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        notification_service_1.NotificationService])
], TaskService);
//# sourceMappingURL=task.service.js.map