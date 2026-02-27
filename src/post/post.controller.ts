import { Body, Controller, Get, Param, Post, Put, Delete, Query, UnauthorizedException } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDTO, UpdatePostDTO, PostQueryDTO } from './dto/post.dto';
import { User } from '../decorators/user.decorator';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  // @Post()
  // createPost(@Body() createPostDTO: CreatePostDTO, @User() user: { id: string }) {
  //   if (!user?.id) throw new UnauthorizedException('x-user-id header required');
  //   return this.postService.createPost(createPostDTO, user.id);
  // }

  // @Get()
  // getAllPosts(@Query() query: PostQueryDTO, @User() user?: { id: string }) {
  //   return this.postService.getAllPosts(query, user?.id);
  // }

  // @Get(':id')
  // getPostById(@Param('id') postId: string, @User() user?: { id: string }) {
  //   return this.postService.getPostById(postId, user?.id);
  // }

  // @Put(':id')
  // updatePost(
  //   @Param('id') postId: string,
  //   @Body() updatePostDTO: UpdatePostDTO,
  //   @User() user: { id: string },
  // ) {
  //   if (!user?.id) throw new UnauthorizedException('x-user-id header required');
  //   return this.postService.updatePost(postId, updatePostDTO, user.id);
  // }

  // @Delete(':id')
  // deletePost(@Param('id') postId: string, @User() user: { id: string }) {
  //   if (!user?.id) throw new UnauthorizedException('x-user-id header required');
  //   return this.postService.deletePost(postId, user.id);
  // }
}
