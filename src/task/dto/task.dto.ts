import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsDateString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus } from '../../enums';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Complete project report', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'Q1 summary and metrics', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: '2026-03-01T18:00:00.000Z', description: 'ISO 8601 date string' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsEnum(TaskPriority)
  @IsNotEmpty()
  priority: TaskPriority;

  @ApiProperty({ example: 'work', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @ApiPropertyOptional({ example: '2026-02-28T09:00:00.000Z', description: 'ISO 8601 date string' })
  @IsDateString()
  @IsOptional()
  reminder?: string;

  @ApiPropertyOptional({ example: 'https://example.com/file.pdf' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'User ID to assign the task to (employee)' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Department ID (required for manager; must match assignee)' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Employee user ID to assign to (must be in same department)' })
  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class UpdateTaskStatusDto {
  @ApiProperty({ enum: TaskStatus, description: 'New status (employee can only update this)' })
  @IsEnum(TaskStatus)
  @IsNotEmpty()
  status: TaskStatus;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Complete project report', maxLength: 150 })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @ApiPropertyOptional({ example: 'Q1 summary and metrics', maxLength: 1000 })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-03-01T18:00:00.000Z', description: 'ISO 8601 date string' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.HIGH })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 'work', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: '2026-02-28T09:00:00.000Z', description: 'ISO 8601 date string' })
  @IsDateString()
  @IsOptional()
  reminder?: string;

  @ApiPropertyOptional({ example: 'https://example.com/file.pdf' })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;

  @ApiPropertyOptional({ description: 'Mark task as completed or not' })
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? undefined : value === 'true' || value === true))
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: 'User ID to assign the task to' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}

export class TaskQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID (owner)' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by assignee ID' })
  @IsOptional()
  @IsString()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'Filter to only unassigned tasks (true/false)' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unassigned?: boolean;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: TaskPriority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ description: 'Filter by completion status (true/false)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    if (value === true || value === 'true') return true;
    return false;
  })
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? parseInt(String(value), 10) || 0 : 0))
  @IsNumber()
  offset?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== '' ? parseInt(String(value), 10) || 10 : 10))
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ enum: ['createdAt', 'dueDate', 'priority'], default: 'createdAt' })
  @IsOptional()
  sortBy?: 'createdAt' | 'dueDate' | 'priority';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}

export class TaskResponseDto {
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
