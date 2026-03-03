import { Model } from 'mongoose';
import { CreateTaskDto, TaskQueryDto, TaskResponseDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto';
import { Task as TaskInterface } from '../interface/task/task.interface';
import { UserDocument } from '../schema/user/user.schema';
import { NotificationService } from '../notification/notification.service';
export declare class TaskService {
    private taskModel;
    private userModel;
    private readonly notificationService;
    constructor(taskModel: Model<TaskInterface>, userModel: Model<UserDocument>, notificationService: NotificationService);
    private toResponse;
    createTask(dto: CreateTaskDto, userId?: string, userRole?: string): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    updateTaskStatus(taskId: string, dto: UpdateTaskStatusDto, userId: string): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    getAllTasks(query: TaskQueryDto, rawIsCompleted?: string, rawUnassigned?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            tasks: TaskResponseDto[];
            total: number;
            offset: number;
            limit: number;
        };
    }>;
    getDashboardStats(departmentId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            byStatus: {
                pending: number;
                in_progress: number;
                completed: number;
            };
            total: number;
        };
    }>;
    getTaskById(taskId: string): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    updateTask(taskId: string, dto: UpdateTaskDto, currentUserId?: string): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    deleteTask(taskId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
