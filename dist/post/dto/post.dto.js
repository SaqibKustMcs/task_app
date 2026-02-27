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
exports.VoteResponseDTO = exports.PostResponseDTO = exports.PostOptionResponseDTO = exports.PostQueryDTO = exports.VotePostDTO = exports.UpdatePostDTO = exports.CreatePostDTO = exports.PostOptionDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class PostOptionDTO {
    text;
}
exports.PostOptionDTO = PostOptionDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostOptionDTO.prototype, "text", void 0);
class CreatePostDTO {
    villageId;
    type;
    text;
    mediaUrl;
    mediaType;
    question;
    options;
}
exports.CreatePostDTO = CreatePostDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDTO.prototype, "villageId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['text', 'image', 'video', 'question']),
    __metadata("design:type", String)
], CreatePostDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDTO.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDTO.prototype, "mediaUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['image', 'video']),
    __metadata("design:type", String)
], CreatePostDTO.prototype, "mediaType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePostDTO.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PostOptionDTO),
    __metadata("design:type", Array)
], CreatePostDTO.prototype, "options", void 0);
class UpdatePostDTO {
    id;
    text;
    mediaUrl;
    mediaType;
    question;
    options;
}
exports.UpdatePostDTO = UpdatePostDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePostDTO.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePostDTO.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePostDTO.prototype, "mediaUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['image', 'video']),
    __metadata("design:type", String)
], UpdatePostDTO.prototype, "mediaType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePostDTO.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PostOptionDTO),
    __metadata("design:type", Array)
], UpdatePostDTO.prototype, "options", void 0);
class VotePostDTO {
    optionId;
}
exports.VotePostDTO = VotePostDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], VotePostDTO.prototype, "optionId", void 0);
class PostQueryDTO {
    type;
    villageId;
    userId;
    search;
    offset;
    limit;
    sortBy = 'createdAt';
    sortOrder = 'desc';
}
exports.PostQueryDTO = PostQueryDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['text', 'image', 'video', 'question']),
    __metadata("design:type", String)
], PostQueryDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostQueryDTO.prototype, "villageId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostQueryDTO.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PostQueryDTO.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === null || value === undefined || value === '')
            return 0;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PostQueryDTO.prototype, "offset", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === null || value === undefined || value === '')
            return 10;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 10 : parsed;
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PostQueryDTO.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['createdAt', 'totalVotes']),
    __metadata("design:type", String)
], PostQueryDTO.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['asc', 'desc']),
    __metadata("design:type", String)
], PostQueryDTO.prototype, "sortOrder", void 0);
class PostOptionResponseDTO {
    id;
    text;
    voteCount;
    percentage;
    isVotedByCurrentUser;
}
exports.PostOptionResponseDTO = PostOptionResponseDTO;
class PostResponseDTO {
    id;
    userId;
    villageId;
    type;
    text;
    mediaUrl;
    mediaType;
    question;
    options;
    totalVotes;
    likedBy;
    likesCount;
    commentsCount;
    sharesCount;
    isLiked;
    hasVoted;
    votedOptionId;
    isSaved;
    isDeleted;
    createdAt;
    updatedAt;
}
exports.PostResponseDTO = PostResponseDTO;
class VoteResponseDTO {
    success;
    message;
    data;
}
exports.VoteResponseDTO = VoteResponseDTO;
//# sourceMappingURL=post.dto.js.map