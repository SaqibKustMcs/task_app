import { HydratedDocument } from 'mongoose';
export type DepartmentDocument = HydratedDocument<Department>;
export declare class Department {
    id: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DepartmentSchema: import("mongoose").Schema<Department, import("mongoose").Model<Department, any, any, any, import("mongoose").Document<unknown, any, Department, any, {}> & Department & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Department, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Department>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Department> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
