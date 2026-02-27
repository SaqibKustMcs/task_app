import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreatePostDTO,
  UpdatePostDTO,
  PostQueryDTO,
  PostResponseDTO,
  PostOptionResponseDTO,
} from './dto/post.dto';
import { Post } from '../schema/post/post.schema';
import { Post as PostInterface } from '../interface/post/post.interface';
import { generateStringId } from '../utils/utils';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostInterface>,
  ) {}

  private validatePostData(createPostDTO: CreatePostDTO): void {
    const { type, text, mediaUrl, mediaType, question, options } = createPostDTO;
    switch (type) {
      case 'text':
        if (!text || text.trim().length === 0) {
          throw new BadRequestException('Text content is required for text posts');
        }
        break;
      case 'image':
      case 'video':
        if (!mediaUrl || mediaUrl.trim().length === 0) {
          throw new BadRequestException('Media URL is required for image/video posts');
        }
        if (!mediaType) {
          throw new BadRequestException('Media type is required for image/video posts');
        }
        break;
      case 'question':
        if (!question || question.trim().length === 0) {
          throw new BadRequestException('Question text is required for question posts');
        }
        if (!options || options.length < 2) {
          throw new BadRequestException('At least 2 options are required for question posts');
        }
        break;
    }
  }

  private toResponse(post: any, currentUserId?: string): PostResponseDTO {
    let optionsWithPercentages: PostOptionResponseDTO[] = [];
    let hasVoted = false;
    let votedOptionId: string | undefined;
    const userId = post.userId?.toString?.() ?? post.userId;
    const villageId = post.villageId?.toString?.() ?? post.villageId;

    if (post.type === 'question' && post.options?.length) {
      const totalVotes = post.totalVotes || 0;
      optionsWithPercentages = post.options.map((option: any) => {
        const isVotedByCurrentUser = currentUserId ? (option.votes || []).includes(currentUserId) : false;
        if (isVotedByCurrentUser) {
          hasVoted = true;
          votedOptionId = option.id;
        }
        return {
          id: option.id,
          text: option.text,
          voteCount: (option.votes || []).length,
          percentage: totalVotes > 0 ? Math.round(((option.votes || []).length / totalVotes) * 100) : 0,
          isVotedByCurrentUser,
        };
      });
    }

    return {
      id: post.id,
      userId,
      villageId: villageId || '',
      type: post.type,
      text: post.text || '',
      mediaUrl: post.mediaUrl || '',
      mediaType: post.mediaType ?? null,
      question: post.question || '',
      options: optionsWithPercentages,
      totalVotes: post.totalVotes || 0,
      likedBy: post.likedBy || [],
      likesCount: post.likesCount || 0,
      commentsCount: post.commentsCount || 0,
      sharesCount: post.sharesCount || 0,
      isLiked: currentUserId ? (post.likedBy || []).includes(currentUserId) : false,
      hasVoted: post.type === 'question' ? hasVoted : undefined,
      votedOptionId: post.type === 'question' ? votedOptionId : undefined,
      isSaved: false,
      isDeleted: post.isDeleted || false,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async createPost(createPostDTO: CreatePostDTO, userId: string): Promise<{ success: boolean; message: string; data: PostResponseDTO }> {
    this.validatePostData(createPostDTO);
    const postData: any = {
      villageId: (createPostDTO.villageId || '').trim(),
      type: createPostDTO.type,
      userId,
      options: (createPostDTO.options || []).map((option) => ({
        id: generateStringId(),
        text: option.text,
        votes: [],
      })),
    };
    if (createPostDTO.text != null) postData.text = createPostDTO.text;
    if ((createPostDTO.type === 'image' || createPostDTO.type === 'video') && createPostDTO.mediaType != null) {
      postData.mediaType = createPostDTO.mediaType;
    }
    if (createPostDTO.mediaUrl != null) postData.mediaUrl = createPostDTO.mediaUrl;
    if (createPostDTO.question != null) postData.question = createPostDTO.question;

    const doc = await new this.postModel(postData).save();
    const data = this.toResponse(doc.toObject?.() ?? doc, userId);
    return { success: true, message: 'Post created successfully', data };
  }

  async getAllPosts(
    query: PostQueryDTO,
    currentUserId?: string,
  ): Promise<{ success: boolean; message: string; data: { posts: PostResponseDTO[]; total: number; offset: number; limit: number } }> {
    const { type, villageId, userId, search, offset = 0, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: any = { isDeleted: false };
    if (type) filter.type = type;
    if (villageId) filter.villageId = villageId;
    if (userId) filter.userId = userId;
    if (search) {
      filter.$or = [
        { text: { $regex: search, $options: 'i' } },
        { question: { $regex: search, $options: 'i' } },
      ];
    }
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await this.postModel.countDocuments(filter);
    const posts: any[] = await this.postModel.find(filter).sort(sort).skip(offset).limit(limit).lean();
    const processedPosts = posts.map((post) => this.toResponse(post, currentUserId));

    return {
      success: true,
      message: 'Posts retrieved successfully',
      data: { posts: processedPosts, total, offset, limit },
    };
  }

  async getPostById(postId: string, currentUserId?: string): Promise<{ success: boolean; message: string; data: PostResponseDTO }> {
    const post = await this.postModel.findOne({ id: postId, isDeleted: false }).lean();
    if (!post) throw new NotFoundException('Post not found');
    const data = this.toResponse(post, currentUserId);
    return { success: true, message: 'Post retrieved successfully', data };
  }

  async updatePost(postId: string, updatePostDTO: UpdatePostDTO, userId: string): Promise<{ success: boolean; message: string; data: PostResponseDTO }> {
    const post = await this.postModel.findOne({ id: postId, isDeleted: false });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('You can only update your own posts');

    const updateFields: any = { ...updatePostDTO };
    delete updateFields.id;
    if (updateFields.options) {
      updateFields.options = updateFields.options.map((option: { text: string }) => ({
        id: generateStringId(),
        text: option.text,
        votes: [],
      }));
    }

    const updated = await this.postModel
      .findOneAndUpdate({ id: postId }, { $set: updateFields }, { new: true })
      .lean();
    const data = this.toResponse(updated, userId);
    return { success: true, message: 'Post updated successfully', data };
  }

  async deletePost(postId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const post = await this.postModel.findOne({ id: postId, isDeleted: false });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId) throw new ForbiddenException('You can only delete your own posts');
    await this.postModel.findOneAndUpdate({ id: postId }, { $set: { isDeleted: true } });
    return { success: true, message: 'Post deleted successfully' };
  }
}
