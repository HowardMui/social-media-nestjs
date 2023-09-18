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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import {
  CreatePostDTO,
  GetPostQueryParamsWithFilter,
  PostResponse,
} from './dto';
import { CacheKey } from '@nestjs/cache-manager';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  // * Basic CRUD ------------------------------------------------------------------------------------

  @ApiOkResponsePaginated(PostResponse)
  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List All Post' })
  @CacheKey('testKey')
  getAllPosts(@Query() query: GetPostQueryParamsWithFilter) {
    return this.postService.getAllPostLists(query);
  }

  @ApiOkResponse({
    description: 'The post records',
    type: PostResponse,
  })
  @Get(':postId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get one Post.' })
  getOnePost(@Param('postId', new ParseIntPipe()) postId: number) {
    return this.postService.getOnePost(postId);
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Create new post. App User only' })
  createOnePost(@Body() body: CreatePostDTO, @Req() req: Request) {
    return this.postService.createOnePost(body, req.user['userId']);
  }

  @Patch(':postId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Update one post. App User only (Not yet finish)' })
  updateUserPost(@Param('postId', new ParseIntPipe()) postId: number) {
    return null;
  }

  @Delete(':postId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete one post. Admin only' })
  deleteUserPost(@Param('postId', new ParseIntPipe()) postId: number) {
    return this.postService.deleteOnePost(postId);
  }

  // * Like a post ------------------------------------------------------------------------------------

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

  // * Share a post to current User Blog ------------------------------------------------------------------------------------

  @Post(':postId/repost')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({
    summary: 'RePost a post to current User blog. App User only',
  })
  rePostToCurrentUserBlog(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.postService.rePostAPostToCurrentUserBlog(
      postId,
      req.user['userId'],
    );
  }

  // * cancel a post to current User Blog ------------------------------------------------------------------------------------

  @Delete(':postId/repost')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Cancel RePost a post. App User only',
  })
  cancelRePostAPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.postService.cancelRePostAPost(postId, req.user['userId']);
  }
}
