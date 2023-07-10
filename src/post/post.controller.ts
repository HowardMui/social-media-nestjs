import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDTO, PostQueryParams } from './dto';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List All Post' })
  getAllPosts(@Query() query: PostQueryParams) {
    return this.postService.getAllPostLists(query);
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Create new post. User only' })
  createOnePost(@Body() body: CreatePostDTO, @Req() req: Request) {
    return this.postService.createOnePost(body, req.user);
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Update one post. User only' })
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
}
