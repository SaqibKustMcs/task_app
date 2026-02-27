import { Model } from 'mongoose';
import { CreatePostDTO, UpdatePostDTO, PostQueryDTO, PostResponseDTO } from './dto/post.dto';
import { Post as PostInterface } from '../interface/post/post.interface';
export declare class PostService {
    private postModel;
    constructor(postModel: Model<PostInterface>);
    private validatePostData;
    private toResponse;
    createPost(createPostDTO: CreatePostDTO, userId: string): Promise<{
        success: boolean;
        message: string;
        data: PostResponseDTO;
    }>;
    getAllPosts(query: PostQueryDTO, currentUserId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            posts: PostResponseDTO[];
            total: number;
            offset: number;
            limit: number;
        };
    }>;
    getPostById(postId: string, currentUserId?: string): Promise<{
        success: boolean;
        message: string;
        data: PostResponseDTO;
    }>;
    updatePost(postId: string, updatePostDTO: UpdatePostDTO, userId: string): Promise<{
        success: boolean;
        message: string;
        data: PostResponseDTO;
    }>;
    deletePost(postId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
