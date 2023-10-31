import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import {
  CreateCommentDTO,
  GetAllPostCommentParams,
  GetCommentInOnePostResponse,
} from '../dto';
import { AuthGuard } from '@nestjs/passport';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Request } from 'express';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';

@ApiTags('Posts')
@Controller('posts')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':postId/comments')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List comment in post' })
  @ApiOkResponsePaginated(GetCommentInOnePostResponse)
  getAllPostComment(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Query() query: GetAllPostCommentParams,
  ) {
    return this.commentService.getPostCommentList(postId, query);
  }

  @Post(':postId/comments')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Leave comment to post. App user only' })
  createOneComment(
    @Req() req: Request,
    @Param('postId', new ParseIntPipe()) postId: number,
    @Body() body: CreateCommentDTO,
  ) {
    return this.commentService.createOneComment(
      req.user['userId'],
      postId,
      body,
    );
  }

  @Delete('comments/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete one comment. Admin Only' })
  deleteOnePostComment(@Param('commentId') commentId: number) {
    return this.commentService.deleteOneComment(commentId);
  }

  // * like comment
  @Post('comment/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Like a comment. App User only' })
  likeAComment(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @Req() req: Request,
  ) {
    return this.commentService.likeACommentByUser(
      commentId,
      req.user['userId'],
    );
  }

  @Delete('comment/:commentId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'UnLike a comment. App User only' })
  unLikeAPost(
    @Param('commentId', new ParseIntPipe()) commentId: number,
    @Req() req: Request,
  ) {
    return this.commentService.unLikeACommentByUser(
      commentId,
      req.user['userId'],
    );
  }
}
