import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTaskDto, TaskQueryDto, TaskResponseDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
import { Task } from '../schema/task/task.schema';
import { Task as TaskInterface } from '../interface/task/task.interface';
import { User, UserDocument } from '../schema/user/user.schema';
import { TaskStatus } from '../enums';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskInterface>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationService: NotificationService,
  ) {}

  private toResponse(task: any): TaskResponseDto {
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

  async createTask(
    dto: CreateTaskDto,
    userId?: string,
    userRole?: string,
  ): Promise<{ success: boolean; message: string; data: TaskResponseDto }> {
    const taskData: any = {
      userId: userId ?? '',
      title: dto.title.trim(),
      dueDate: new Date(dto.dueDate),
      priority: dto.priority,
      category: dto.category?.trim() ?? '',
      status: TaskStatus.PENDING,
    };
    if (dto.description != null) taskData.description = dto.description;
    if (dto.reminder != null) taskData.reminder = new Date(dto.reminder);
    if (dto.attachmentUrl != null) taskData.attachmentUrl = dto.attachmentUrl;
    if (dto.assigneeId != null && dto.assigneeId.trim() !== '') taskData.assigneeId = dto.assigneeId.trim();

    if (userRole === 'manager') {
      taskData.assignedBy = userId ?? null;
      taskData.departmentId = dto.departmentId?.trim() || null;
      const assignTo = dto.assignedTo?.trim() || dto.assigneeId?.trim();
      if (assignTo) {
        const employee = await this.userModel.findOne({ id: assignTo }).lean().exec();
        if (!employee) throw new NotFoundException('Assigned employee not found');
        if ((employee as any).role !== 'employee') {
          throw new BadRequestException('Can only assign tasks to employees');
        }
        const empDept = (employee as any).departmentId ?? null;
        const taskDept = taskData.departmentId ?? (await this.userModel.findOne({ id: userId }).lean().then((u: any) => u?.departmentId ?? null));
        if (empDept && taskDept && empDept !== taskDept) {
          throw new ForbiddenException('Employee must be in the same department');
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
        taskId: (doc as any).id,
        taskTitle: taskData.title,
        assignedByUserId: userId,
        assignedByName: (manager as any)?.name ?? undefined,
      }).catch((e) => {
        console.warn('[Notifications] notifyTaskAssigned failed (createTask):', e);
      });
    }
    return { success: true, message: 'Task created successfully', data };
  }

  async updateTaskStatus(
    taskId: string,
    dto: UpdateTaskStatusDto,
    userId: string,
  ): Promise<{ success: boolean; message: string; data: TaskResponseDto }> {
    if (!taskId?.trim()) throw new BadRequestException('Task id is required');
    const doc = await this.taskModel.findOne({ id: taskId, isDeleted: { $ne: true } }).exec();
    if (!doc) throw new NotFoundException('Task not found');
    const assignedTo = (doc as any).assignedTo ?? (doc as any).assigneeId;
    if (assignedTo !== userId) {
      throw new ForbiddenException('Only the assigned employee can update task status');
    }
    const update: any = {
      status: dto.status,
      isCompleted: dto.status === TaskStatus.COMPLETED,
      updatedAt: new Date(),
    };
    const updated = await this.taskModel.findOneAndUpdate({ id: taskId }, { $set: update }, { new: true }).exec();
    const data = this.toResponse((updated as any)?.toObject?.() ?? updated);
    return { success: true, message: 'Task status updated', data };
  }

  async getAllTasks(
    query: TaskQueryDto,
    rawIsCompleted?: string,
    rawUnassigned?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: { tasks: TaskResponseDto[]; total: number; offset: number; limit: number };
  }> {
    const offset = Math.max(0, Number(query.offset ?? 0) || 0);
    const limit = Math.min(100, Math.max(1, Number(query.limit ?? 10) || 10));

    const filter: any = { isDeleted: { $ne: true } };
    if (query.userId) filter.userId = query.userId;
    if (query.assigneeId) filter.assigneeId = query.assigneeId;
    if (query.departmentId) filter.departmentId = query.departmentId;
    if (query.status) filter.status = query.status;
    // Unassigned: tasks with no assignee (null, empty, or missing)
    const wantUnassigned =
      (rawUnassigned !== undefined && String(rawUnassigned).toLowerCase() === 'true') ||
      query.unassigned === true;
    if (wantUnassigned) {
      filter.$or = [
        { assigneeId: null },
        { assigneeId: '' },
        { assigneeId: { $exists: false } },
      ];
    }
    if (query.category) filter.category = query.category;
    if (query.priority) filter.priority = query.priority;
    // isCompleted: use raw query param first so "false" / "true" from client are applied correctly
    if (rawIsCompleted !== undefined && rawIsCompleted !== '') {
      const wantCompleted = String(rawIsCompleted).toLowerCase() === 'true';
      filter.isCompleted = { $eq: wantCompleted };
    } else if (query.isCompleted === false) {
      filter.isCompleted = { $eq: false };
    } else if (query.isCompleted === true) {
      filter.isCompleted = { $eq: true };
    }

    let sort: any = { createdAt: -1 };
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const dir = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'dueDate') sort = { dueDate: dir };
    else if (sortBy === 'priority') sort = { priority: dir };
    else sort = { createdAt: dir };

    const [total, docs] = await Promise.all([
      this.taskModel.countDocuments(filter).exec(),
      this.taskModel.find(filter).sort(sort).skip(offset).limit(limit).exec(),
    ]);

    const tasks = docs.map((d: any) => this.toResponse(d.toObject?.() ?? d));
    return {
      success: true,
      message: 'Tasks retrieved successfully',
      data: { tasks, total, offset, limit },
    };
  }

  async getDashboardStats(
    departmentId?: string,
  ): Promise<{
    success: boolean;
    message: string;
    data: { byStatus: { pending: number; in_progress: number; completed: number }; total: number };
  }> {
    const match: any = { isDeleted: { $ne: true } };
    if (departmentId) match.departmentId = departmentId;
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

  async getTaskById(
    taskId: string,
  ): Promise<{ success: boolean; message: string; data: TaskResponseDto }> {
    if (!taskId || String(taskId).trim() === '') {
      throw new BadRequestException('Task id is required');
    }
    const doc = await this.taskModel
      .findOne({ id: taskId, isDeleted: { $ne: true } })
      .exec();
    if (!doc) {
      throw new NotFoundException('Task not found');
    }
    const data = this.toResponse((doc as any).toObject?.() ?? doc);
    return { success: true, message: 'Task retrieved successfully', data };
  }

  async updateTask(
    taskId: string,
    dto: UpdateTaskDto,
    currentUserId?: string,
  ): Promise<{ success: boolean; message: string; data: TaskResponseDto }> {
    if (!taskId || String(taskId).trim() === '') {
      throw new BadRequestException('Task id is required');
    }
    const doc = await this.taskModel
      .findOne({ id: taskId, isDeleted: { $ne: true } })
      .exec();
    if (!doc) {
      throw new NotFoundException('Task not found');
    }
    const update: any = {};
    if (dto.title !== undefined) update.title = dto.title.trim();
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.dueDate !== undefined) update.dueDate = new Date(dto.dueDate);
    if (dto.priority !== undefined) update.priority = dto.priority;
    if (dto.category !== undefined) update.category = dto.category.trim();
    if (dto.reminder !== undefined) update.reminder = dto.reminder ? new Date(dto.reminder) : null;
    if (dto.attachmentUrl !== undefined) update.attachmentUrl = dto.attachmentUrl;
    if (typeof dto.isCompleted === 'boolean') update.isCompleted = dto.isCompleted;
    if (dto.assigneeId !== undefined) update.assigneeId = dto.assigneeId?.trim() === '' ? null : dto.assigneeId?.trim() ?? null;
    if (dto.status !== undefined) {
      update.status = dto.status;
      update.isCompleted = dto.status === 'completed';
    }
    if (Object.keys(update).length === 0) {
      const data = this.toResponse((doc as any).toObject?.() ?? doc);
      return { success: true, message: 'Task unchanged', data };
    }
    const previousAssignee = (doc as any).assigneeId ?? (doc as any).assignedTo ?? null;
    const newAssignee = update.assigneeId !== undefined
      ? (update.assigneeId?.trim() === '' ? null : update.assigneeId?.trim() ?? null)
      : previousAssignee;
    update.updatedAt = new Date();
    const updated = await this.taskModel
      .findOneAndUpdate(
        { id: taskId },
        { $set: update },
        { new: true },
      )
      .exec();
    const data = this.toResponse((updated as any)?.toObject?.() ?? updated);
    if (newAssignee && newAssignee !== previousAssignee) {
      const manager = await this.userModel
        .findOne({ id: currentUserId ?? (doc as any).userId })
        .lean()
        .exec();
      this.notificationService.notifyTaskAssigned({
        assigneeUserId: newAssignee,
        taskId,
        taskTitle: (updated as any)?.title ?? '',
        assignedByUserId: currentUserId ?? (doc as any).userId ?? null,
        assignedByName: (manager as any)?.name ?? undefined,
      }).catch((e) => {
        console.warn('[Notifications] notifyTaskAssigned failed (updateTask):', e);
      });
    }
    return { success: true, message: 'Task updated successfully', data };
  }

  async deleteTask(
    taskId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!taskId || String(taskId).trim() === '') {
      throw new BadRequestException('Task id is required');
    }
    const doc = await this.taskModel
      .findOne({ id: taskId, isDeleted: { $ne: true } })
      .exec();
    if (!doc) {
      throw new NotFoundException('Task not found');
    }
    const taskUserId = (doc as any).userId?.toString?.() ?? (doc as any).userId ?? '';
    if (taskUserId && userId && taskUserId !== userId) {
      throw new ForbiddenException('Only the task owner can delete this task');
    }
    await this.taskModel
      .findOneAndUpdate(
        { id: taskId },
        { $set: { isDeleted: true, updatedAt: new Date() } },
        { new: true },
      )
      .exec();
    return { success: true, message: 'Task deleted successfully' };
  }
}
