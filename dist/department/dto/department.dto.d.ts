export declare class CreateDepartmentDto {
    name: string;
    description?: string;
}
export declare class UpdateDepartmentDto {
    name?: string;
    description?: string;
}
export declare class DepartmentResponseDto {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
