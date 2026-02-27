"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const department_schema_1 = require("../schema/department/department.schema");
let DepartmentService = class DepartmentService {
    departmentModel;
    constructor(departmentModel) {
        this.departmentModel = departmentModel;
    }
    toResponse(dept) {
        return {
            id: dept.id,
            name: dept.name ?? '',
            description: dept.description ?? '',
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
        };
    }
    async create(dto) {
        const doc = await this.departmentModel.create({
            name: dto.name.trim(),
            description: dto.description?.trim() ?? '',
        });
        const data = this.toResponse(doc.toObject?.() ?? doc);
        return { success: true, message: 'Department created successfully', data };
    }
    async findAll() {
        const docs = await this.departmentModel.find().sort({ name: 1 }).lean().exec();
        const data = docs.map((d) => this.toResponse(d));
        return { success: true, message: 'Departments retrieved successfully', data };
    }
    async findById(id) {
        const doc = await this.departmentModel.findOne({ id }).lean().exec();
        if (!doc)
            throw new common_1.NotFoundException('Department not found');
        const data = this.toResponse(doc);
        return { success: true, message: 'Department retrieved successfully', data };
    }
    async update(id, dto) {
        const update = { updatedAt: new Date() };
        if (dto.name != null)
            update.name = dto.name.trim();
        if (dto.description != null)
            update.description = dto.description?.trim() ?? '';
        const doc = await this.departmentModel
            .findOneAndUpdate({ id }, { $set: update }, { new: true })
            .lean()
            .exec();
        if (!doc)
            throw new common_1.NotFoundException('Department not found');
        const data = this.toResponse(doc);
        return { success: true, message: 'Department updated successfully', data };
    }
};
exports.DepartmentService = DepartmentService;
exports.DepartmentService = DepartmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DepartmentService);
//# sourceMappingURL=department.service.js.map