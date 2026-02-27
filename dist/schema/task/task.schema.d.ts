import { HydratedDocument } from 'mongoose';
export type TaskDocument = HydratedDocument<Task>;
export declare class Task {
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
export declare const TaskSchema: import("mongoose").Schema<Task, import("mongoose").Model<Task, any, any, any, import("mongoose").Document<unknown, any, Task, any, {}> & Task & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Task, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Task>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Task> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
