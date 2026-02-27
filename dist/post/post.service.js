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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("../schema/post/post.schema");
const utils_1 = require("../utils/utils");
let PostService = class PostService {
    postModel;
    constructor(postModel) {
        this.postModel = postModel;
    }
    validatePostData(createPostDTO) {
        const { type, text, mediaUrl, mediaType, question, options } = createPostDTO;
        switch (type) {
            case 'text':
                if (!text || text.trim().length === 0) {
                    throw new common_1.BadRequestException('Text content is required for text posts');
                }
                break;
            case 'image':
            case 'video':
                if (!mediaUrl || mediaUrl.trim().length === 0) {
                    throw new common_1.BadRequestException('Media URL is required for image/video posts');
                }
                if (!mediaType) {
                    throw new common_1.BadRequestException('Media type is required for image/video posts');
                }
                break;
            case 'question':
                if (!question || question.trim().length === 0) {
                    throw new common_1.BadRequestException('Question text is required for question posts');
                }
                if (!options || options.length < 2) {
                    throw new common_1.BadRequestException('At least 2 options are required for question posts');
                }
                break;
        }
    }
    toResponse(post, currentUserId) {
        let optionsWithPercentages = [];
        let hasVoted = false;
        let votedOptionId;
        const userId = post.userId?.toString?.() ?? post.userId;
        const villageId = post.villageId?.toString?.() ?? post.villageId;
        if (post.type === 'question' && post.options?.length) {
            const totalVotes = post.totalVotes || 0;
            optionsWithPercentages = post.options.map((option) => {
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
    async createPost(createPostDTO, userId) {
        this.validatePostData(createPostDTO);
        const postData = {
            villageId: (createPostDTO.villageId || '').trim(),
            type: createPostDTO.type,
            userId,
            options: (createPostDTO.options || []).map((option) => ({
                id: (0, utils_1.generateStringId)(),
                text: option.text,
                votes: [],
            })),
        };
        if (createPostDTO.text != null)
            postData.text = createPostDTO.text;
        if ((createPostDTO.type === 'image' || createPostDTO.type === 'video') && createPostDTO.mediaType != null) {
            postData.mediaType = createPostDTO.mediaType;
        }
        if (createPostDTO.mediaUrl != null)
            postData.mediaUrl = createPostDTO.mediaUrl;
        if (createPostDTO.question != null)
            postData.question = createPostDTO.question;
        const doc = await new this.postModel(postData).save();
        const data = this.toResponse(doc.toObject?.() ?? doc, userId);
        return { success: true, message: 'Post created successfully', data };
    }
    async getAllPosts(query, currentUserId) {
        const { type, villageId, userId, search, offset = 0, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
        const filter = { isDeleted: false };
        if (type)
            filter.type = type;
        if (villageId)
            filter.villageId = villageId;
        if (userId)
            filter.userId = userId;
        if (search) {
            filter.$or = [
                { text: { $regex: search, $options: 'i' } },
                { question: { $regex: search, $options: 'i' } },
            ];
        }
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const total = await this.postModel.countDocuments(filter);
        const posts = await this.postModel.find(filter).sort(sort).skip(offset).limit(limit).lean();
        const processedPosts = posts.map((post) => this.toResponse(post, currentUserId));
        return {
            success: true,
            message: 'Posts retrieved successfully',
            data: { posts: processedPosts, total, offset, limit },
        };
    }
    async getPostById(postId, currentUserId) {
        const post = await this.postModel.findOne({ id: postId, isDeleted: false }).lean();
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const data = this.toResponse(post, currentUserId);
        return { success: true, message: 'Post retrieved successfully', data };
    }
    async updatePost(postId, updatePostDTO, userId) {
        const post = await this.postModel.findOne({ id: postId, isDeleted: false });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.userId !== userId)
            throw new common_1.ForbiddenException('You can only update your own posts');
        const updateFields = { ...updatePostDTO };
        delete updateFields.id;
        if (updateFields.options) {
            updateFields.options = updateFields.options.map((option) => ({
                id: (0, utils_1.generateStringId)(),
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
    async deletePost(postId, userId) {
        const post = await this.postModel.findOne({ id: postId, isDeleted: false });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        if (post.userId !== userId)
            throw new common_1.ForbiddenException('You can only delete your own posts');
        await this.postModel.findOneAndUpdate({ id: postId }, { $set: { isDeleted: true } });
        return { success: true, message: 'Post deleted successfully' };
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostService);
//# sourceMappingURL=post.service.js.map