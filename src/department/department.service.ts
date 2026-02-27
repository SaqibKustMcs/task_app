import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Department } from '../schema/department/department.schema';
import {
  CreateDepartmentDto,
  DepartmentResponseDto,
  UpdateDepartmentDto,
} from './dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  private toResponse(dept: any): DepartmentResponseDto {
    return {
      id: dept.id,
      name: dept.name ?? '',
      description: dept.description ?? '',
      createdAt: dept.createdAt,
      updatedAt: dept.updatedAt,
    };
  }

  async create(
    dto: CreateDepartmentDto,
  ): Promise<{ success: boolean; message: string; data: DepartmentResponseDto }> {
    const doc = await this.departmentModel.create({
      name: dto.name.trim(),
      description: dto.description?.trim() ?? '',
    });
    const data = this.toResponse(doc.toObject?.() ?? doc);
    return { success: true, message: 'Department created successfully', data };
  }

  async findAll(): Promise<{
    success: boolean;
    message: string;
    data: DepartmentResponseDto[];
  }> {
    const docs = await this.departmentModel.find().sort({ name: 1 }).lean().exec();
    const data = (docs as any[]).map((d) => this.toResponse(d));
    return { success: true, message: 'Departments retrieved successfully', data };
  }

  async findById(
    id: string,
  ): Promise<{ success: boolean; message: string; data: DepartmentResponseDto }> {
    const doc = await this.departmentModel.findOne({ id }).lean().exec();
    if (!doc) throw new NotFoundException('Department not found');
    const data = this.toResponse(doc);
    return { success: true, message: 'Department retrieved successfully', data };
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<{ success: boolean; message: string; data: DepartmentResponseDto }> {
    const update: any = { updatedAt: new Date() };
    if (dto.name != null) update.name = dto.name.trim();
    if (dto.description != null) update.description = dto.description?.trim() ?? '';
    const doc = await this.departmentModel
      .findOneAndUpdate({ id }, { $set: update }, { new: true })
      .lean()
      .exec();
    if (!doc) throw new NotFoundException('Department not found');
    const data = this.toResponse(doc);
    return { success: true, message: 'Department updated successfully', data };
  }
}
