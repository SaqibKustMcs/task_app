import { Request } from 'express';
import { CreateTaskDto, TaskQueryDto, TaskResponseDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto';
import { RequestUser } from '../decorators/user.decorator';
type TaskServiceShape = {
    createTask(dto: CreateTaskDto, userId?: string, userRole?: string): Promise<{
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
    updateTask(taskId: string, dto: UpdateTaskDto): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    updateTaskStatus(taskId: string, dto: UpdateTaskStatusDto, userId: string): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    deleteTask(taskId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
};
export declare class TaskController {
    private readonly taskService;
    constructor(taskService: TaskServiceShape);
    createTask(createTaskDto: CreateTaskDto, user?: RequestUser): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    getAllTasks(query: TaskQueryDto, req?: Request): Promise<{
        success: boolean;
        message: string;
        data: {
            tasks: TaskResponseDto[];
            total: number;
            offset: number;
            limit: number;
        };
    }>;
    getDashboardStats(departmentId?: string, user?: RequestUser): Promise<{
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
    updateTaskStatus(taskId: string, dto: UpdateTaskStatusDto, user?: RequestUser): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    updateTask(taskId: string, dto: UpdateTaskDto): Promise<{
        success: boolean;
        message: string;
        data: TaskResponseDto;
    }>;
    deleteTask(taskId: string, user?: RequestUser): Promise<{
        success: boolean;
        message: string;
    }>;
}
export {};
