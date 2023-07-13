import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreateCommentDTO, GetAllPostCommentParams } from './dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaSrcService) {}

  async getPostCommentList(postId: number, query: GetAllPostCommentParams) {
    const { limit, offset, asc, desc } = query;
    try {
      const findComment = await this.prisma.comment.findMany({
        where: {
          postId,
        },
        skip: offset,
        take: limit,
      });

      return {
        count: findComment.length,
        rows: findComment,
        limit,
        offset,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async createOneComment(user, body: CreateCommentDTO) {
    try {
      return await this.prisma.comment.create({
        data: { ...body, userId: user['userId'] },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteOneComment(commentId: number) {
    try {
      await this.prisma.comment.delete({
        where: {
          commentId,
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }
}
