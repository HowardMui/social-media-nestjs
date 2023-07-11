import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDTO, GetAllPostCommentParams } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Request } from 'express';
import { GetReqReturnType } from 'src/types';
import { Comment } from '@prisma/client';

@ApiTags('Posts')
@Controller('posts')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':postId/comments')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List comment in post' })
  getAllPostComment(
    @Param('postId') postId: number,
    @Query() query: GetAllPostCommentParams,
  ): Promise<GetReqReturnType<Comment>> {
    return this.commentService.getPostCommentList(postId, query);
  }

  @Post(':postId/comments')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Leave comment to post. App user only' })
  createOneComment(
    @Req() req: Request,
    @Param('postId') postId: number,
    @Body() body: CreateCommentDTO,
  ) {
    return this.commentService.createOneComment(req.user, body);
  }
}
