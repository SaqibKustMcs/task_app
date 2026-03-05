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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSchema = exports.Task = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const utils_1 = require("../../utils/utils");
let Task = class Task {
    id;
    userId;
    assigneeId;
    assignedBy;
    assignedTo;
    departmentId;
    title;
    description;
    status;
    dueDate;
    priority;
    category;
    reminder;
    attachmentUrl;
    isDeleted;
    isCompleted;
    createdAt;
    updatedAt;
};
exports.Task = Task;
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: utils_1.generateStringId }),
    __metadata("design:type", String)
], Task.prototype, "id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Task.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Task.prototype, "assigneeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Task.prototype, "assignedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Task.prototype, "assignedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Task.prototype, "departmentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['pending', 'assigned', 'in_progress', 'completed'], default: 'pending' }),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], Task.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, enum: ['low', 'medium', 'high', 'urgent'] }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Task.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], Task.prototype, "reminder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: '' }),
    __metadata("design:type", String)
], Task.prototype, "attachmentUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Task.prototype, "isCompleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Task.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Task.prototype, "updatedAt", void 0);
exports.Task = Task = __decorate([
    (0, mongoose_1.Schema)()
], Task);
exports.TaskSchema = mongoose_1.SchemaFactory.createForClass(Task);
exports.TaskSchema.set('timestamps', true);
exports.TaskSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
    },
});
exports.TaskSchema.index({ userId: 1 });
exports.TaskSchema.index({ assigneeId: 1 });
exports.TaskSchema.index({ assignedBy: 1 });
exports.TaskSchema.index({ assignedTo: 1 });
exports.TaskSchema.index({ departmentId: 1 });
exports.TaskSchema.index({ status: 1 });
exports.TaskSchema.index({ dueDate: 1 });
exports.TaskSchema.index({ isDeleted: 1 });
exports.TaskSchema.index({ createdAt: -1 });
//# sourceMappingURL=task.schema.js.map