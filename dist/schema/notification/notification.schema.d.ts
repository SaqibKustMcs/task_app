import { HydratedDocument } from 'mongoose';
export type NotificationDocument = HydratedDocument<Notification>;
export declare class Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    taskId: string | null;
    assignedByUserId: string | null;
    read: boolean;
    createdAt: Date;
}
export declare const NotificationSchema: import("mongoose").Schema<Notification, import("mongoose").Model<Notification, any, any, any, import("mongoose").Document<unknown, any, Notification, any, {}> & Notification & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Notification, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Notification>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Notification> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
