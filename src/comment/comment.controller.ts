import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';

@ApiTags('Posts')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':postId/comments')
  getAllPostComment(@Param('postId') postId: number) {
    return this.commentService.getCommentList(postId);
  }
}
