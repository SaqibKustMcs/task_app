import { TaskStatus } from '../../enums';
export declare enum TaskPriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent"
}
export declare class CreateTaskDto {
    title: string;
    description?: string;
    dueDate: string;
    priority: TaskPriority;
    category: string;
    reminder?: string;
    attachmentUrl?: string;
    assigneeId?: string;
    departmentId?: string;
    assignedTo?: string;
}
export declare class UpdateTaskStatusDto {
    status: TaskStatus;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    category?: string;
    reminder?: string;
    attachmentUrl?: string;
    isCompleted?: boolean;
    assigneeId?: string;
    status?: TaskStatus;
}
export declare class TaskQueryDto {
    userId?: string;
    departmentId?: string;
    status?: string;
    assigneeId?: string;
    unassigned?: boolean;
    category?: string;
    priority?: TaskPriority;
    isCompleted?: boolean;
    offset?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'dueDate' | 'priority';
    sortOrder?: 'asc' | 'desc';
}
export declare class TaskResponseDto {
    id: string;
    userId: string;
    assigneeId: string | null;
    assignedBy: string | null;
    assignedTo: string | null;
    departmentId: string | null;
    title: string;
    description: string;
    status: string;
    dueDate: Date;
    priority: string;
    category: string;
    reminder: Date | null;
    attachmentUrl: string;
    isDeleted: boolean;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
