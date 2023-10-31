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
  UpdatePostDTO,
} from './dto';
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
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update one post. Admin only' })
  updateUserPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() body: UpdatePostDTO,
  ) {
    return this.postService.updateOnePost(body, postId);
  }

  @Delete(':postId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete one post. Admin only' })
  deleteUserPost(@Param('postId', new ParseIntPipe()) postId: number) {
    return this.postService.deleteOnePost(postId);
  }
}
