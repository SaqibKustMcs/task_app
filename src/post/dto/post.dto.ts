import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsNotEmpty, ValidateNested, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PostOptionDTO {
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class CreatePostDTO {
  @IsOptional()
  @IsString()
  villageId?: string;

  @IsEnum(['text', 'image', 'video', 'question'])
  type: 'text' | 'image' | 'video' | 'question';

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(['image', 'video'])
  mediaType?: 'image' | 'video';

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostOptionDTO)
  options?: PostOptionDTO[];
}

export class UpdatePostDTO {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(['image', 'video'])
  mediaType?: 'image' | 'video';

  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostOptionDTO)
  options?: PostOptionDTO[];
}

export class VotePostDTO {
  @IsString()
  @IsNotEmpty()
  optionId: string;
}

export class PostQueryDTO {
  @IsOptional()
  @IsEnum(['text', 'image', 'video', 'question'])
  type?: 'text' | 'image' | 'video' | 'question';

  @IsOptional()
  @IsString()
  villageId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  })
  @IsNumber()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return 10;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 10 : parsed;
  })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsEnum(['createdAt', 'totalVotes'])
  sortBy?: 'createdAt' | 'totalVotes' = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PostOptionResponseDTO {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  isVotedByCurrentUser?: boolean;
}

export class PostResponseDTO {
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

export class VoteResponseDTO {
  success: boolean;
  message: string;
  data: PostResponseDTO;
}
