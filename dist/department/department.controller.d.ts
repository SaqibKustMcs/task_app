import { DepartmentService } from './department.service';
import { CreateDepartmentDto, DepartmentResponseDto, UpdateDepartmentDto } from './dto/department.dto';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
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
