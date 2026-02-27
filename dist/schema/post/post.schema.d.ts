import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
export type postDocument = HydratedDocument<Post>;
export declare class PostOption {
    id: string;
    text: string;
    votes: string[];
}
export declare const PostOptionSchema: MongooseSchema<PostOption, import("mongoose").Model<PostOption, any, any, any, import("mongoose").Document<unknown, any, PostOption, any, {}> & PostOption & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostOption, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PostOption>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PostOption> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Post {
    id: string;
    userId: string;
    villageId: string;
    type: 'text' | 'image' | 'video' | 'question';
    text: string;
    mediaUrl: string;
    mediaType?: 'image' | 'video';
    question: string;
    options: PostOption[];
    totalVotes: number;
    likedBy: string[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PostSchema: MongooseSchema<Post, import("mongoose").Model<Post, any, any, any, import("mongoose").Document<unknown, any, Post, any, {}> & Post & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Post, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Post>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Post> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
