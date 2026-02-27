export declare class PostOptionDTO {
    text: string;
}
export declare class CreatePostDTO {
    villageId?: string;
    type: 'text' | 'image' | 'video' | 'question';
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    question?: string;
    options?: PostOptionDTO[];
}
export declare class UpdatePostDTO {
    id?: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    question?: string;
    options?: PostOptionDTO[];
}
export declare class VotePostDTO {
    optionId: string;
}
export declare class PostQueryDTO {
    type?: 'text' | 'image' | 'video' | 'question';
    villageId?: string;
    userId?: string;
    search?: string;
    offset?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'totalVotes';
    sortOrder?: 'asc' | 'desc';
}
export declare class PostOptionResponseDTO {
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
    isVotedByCurrentUser?: boolean;
}
export declare class PostResponseDTO {
    id: string;
    userId: string;
    villageId: string;
    type: 'text' | 'image' | 'video' | 'question';
    text: string;
    mediaUrl: string;
    mediaType: 'image' | 'video' | null;
    question: string;
    options: PostOptionResponseDTO[];
    totalVotes: number;
    likedBy: string[];
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    isLiked?: boolean;
    hasVoted?: boolean;
    votedOptionId?: string;
    isSaved?: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VoteResponseDTO {
    success: boolean;
    message: string;
    data: PostResponseDTO;
}
