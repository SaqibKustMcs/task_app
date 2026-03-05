import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto, TaskQueryDto, TaskResponseDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto';
import { User, RequestUser } from '../decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../auth/guards/roles.guard';

/** Local type so IDE sees TaskService methods */
type TaskServiceShape = {
  createTask(dto: CreateTaskDto, userId?: string, userRole?: string): Promise<{ success: boolean; message: string; data: TaskResponseDto }>;
  getAllTasks(query: TaskQueryDto, rawIsCompleted?: string, rawUnassigned?: string): Promise<{ success: boolean; message: string; data: { tasks: TaskResponseDto[]; total: number; offset: number; limit: number } }>;
  getDashboardStats(departmentId?: string): Promise<{ success: boolean; message: string; data: { byStatus: { pending: number; assigned: number; in_progress: number; completed: number }; total: number } }>;
  getTaskById(taskId: string): Promise<{ success: boolean; message: string; data: TaskResponseDto }>;
  updateTask(taskId: string, dto: UpdateTaskDto, userId?: string): Promise<{ success: boolean; message: string; data: TaskResponseDto }>;
  updateTaskStatus(taskId: string, dto: UpdateTaskStatusDto, userId: string): Promise<{ success: boolean; message: string; data: TaskResponseDto }>;
  deleteTask(taskId: string, userId: string): Promise<{ success: boolean; message: string }>;
};

@ApiTags('tasks')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(@Inject(TaskService) private readonly taskService: TaskServiceShape) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  createTask(@Body() createTaskDto: CreateTaskDto, @User() user?: RequestUser) {
    return (this.taskService as TaskServiceShape).createTask(
      createTaskDto,
      user?.id ?? '',
      user?.role,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  getAllTasks(@Query() query: TaskQueryDto, @Req() req?: Request) {
    const rawIsCompleted = req?.query?.isCompleted as string | undefined;
    const rawUnassigned = req?.query?.unassigned as string | undefined;
    return (this.taskService as TaskServiceShape).getAllTasks(query, rawIsCompleted, rawUnassigned);
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Dashboard statistics by status' })
  @ApiResponse({ status: 200, description: 'Stats (byStatus, total)' })
  getDashboardStats(@Query('departmentId') departmentId?: string, @User() user?: RequestUser) {
    const deptId = departmentId || user?.departmentId || undefined;
    return (this.taskService as TaskServiceShape).getDashboardStats(deptId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getTaskById(@Param('id') taskId: string) {
    return (this.taskService as TaskServiceShape).getTaskById(taskId);
  }

  @Patch(':id/status')
  @SetMetadata(ROLES_KEY, ['employee'])
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update task status (employee only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - not assigned employee' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateTaskStatus(
    @Param('id') taskId: string,
    @Body() dto: UpdateTaskStatusDto,
    @User() user?: RequestUser,
  ) {
    return (this.taskService as TaskServiceShape).updateTaskStatus(
      taskId,
      dto,
      user?.id ?? '',
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  updateTask(@Param('id') taskId: string, @Body() dto: UpdateTaskDto, @User() user?: RequestUser) {
    return (this.taskService as TaskServiceShape).updateTask(taskId, dto, user?.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task by ID (owner only)' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not task owner' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  deleteTask(@Param('id') taskId: string, @User() user?: RequestUser) {
    return (this.taskService as TaskServiceShape).deleteTask(taskId, user?.id ?? '');
  }
}
