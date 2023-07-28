import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreateCommentDTO, GetAllPostCommentParams } from './dto';
import { returnAscOrDescInQueryParams } from 'src/helper';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaSrcService) {}

  async getPostCommentList(postId: number, query: GetAllPostCommentParams) {
    const { limit, offset, asc, desc } = query;
    try {
      const findComment = await this.prisma.comment.findMany({
        where: {
          postId,
          parentCommentId: null,
        },
        include: {
          comments: {
            include: {
              comments: true,
            },
          },
        },
        orderBy: returnAscOrDescInQueryParams(asc, desc) || {
          commentId: 'desc',
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

  async createOneComment(
    userId: number,
    postId: number,
    body: CreateCommentDTO,
  ) {
    const { message, parentCommentId } = body;

    try {
      const createCommentObject = await this.prisma.comment.create({
        data: {
          message,
          userId,
          postId,
          parentCommentId: !parentCommentId ? null : parentCommentId,
        },
      });
      return createCommentObject;
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
