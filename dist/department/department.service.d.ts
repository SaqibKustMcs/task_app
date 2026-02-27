import { Model } from 'mongoose';
import { Department } from '../schema/department/department.schema';
import { CreateDepartmentDto, DepartmentResponseDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentService {
    private departmentModel;
    constructor(departmentModel: Model<Department>);
    private toResponse;
    create(dto: CreateDepartmentDto): Promise<{
        success: boolean;
        message: string;
        data: DepartmentResponseDto;
    }>;
    findAll(): Promise<{
        success: boolean;
        message: string;
        data: DepartmentResponseDto[];
    }>;
    findById(id: string): Promise<{
        success: boolean;
        message: string;
        data: DepartmentResponseDto;
    }>;
    update(id: string, dto: UpdateDepartmentDto): Promise<{
        success: boolean;
        message: string;
        data: DepartmentResponseDto;
    }>;
}
