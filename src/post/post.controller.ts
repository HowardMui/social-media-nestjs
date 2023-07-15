import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { CreatePostDTO, GetPostQueryParams } from './dto';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  // Basic CRUD ------------------------------------------------------------------------------------

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List All Post' })
  getAllPosts(@Query() query: GetPostQueryParams) {
    return this.postService.getAllPostLists(query);
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Create new post. App User only' })
  createOnePost(@Body() body: CreatePostDTO, @Req() req: Request) {
    return this.postService.createOnePost(body, req.user);
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Update one post. App User only' })
  updateUserPost() {
    return null;
  }

  @Delete('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete one post. Admin only' })
  deleteUserPost(@Param('postId') postId: number) {
    return this.postService.deleteOneUserPost(postId);
  }

  // Like a post ------------------------------------------------------------------------------------

  // @Get(':postId/like')

  @Post(':postId/like')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Like a post. App User only' })
  likeAPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.postService.likeAPostByUser(postId, req.user['userId']);
  }

  @Delete(':postId/like')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'UnLike a post. App User only' })
  unLikeAPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.postService.unLikeAPost(postId, req.user['userId']);
  }
}
