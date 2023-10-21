import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDTO, GetAllPostCommentParams } from '../dto';
import { orderByFilter } from 'src/helper';
import { InjectModel } from '@nestjs/sequelize';
import { CommentModel, PostModel, UserModel } from 'src/models';
import { Op } from 'sequelize';
import { errorHandler } from 'src/error-handler';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(CommentModel)
    private commentModel: typeof CommentModel,
    @InjectModel(PostModel)
    private postModel: typeof PostModel,
  ) {}

  async getPostCommentList(postId: number, query: GetAllPostCommentParams) {
    const { limit, offset, asc, desc } = query;
    try {
      const { count, rows } = await this.commentModel.findAndCountAll({
        where: {
          postId,
          parentCommentId: {
            [Op.not]: true,
          },
        },
        include: [
          {
            model: PostModel,
          },
          {
            model: CommentModel,
            as: 'comments',
            include: [
              UserModel,
              {
                model: CommentModel,
                as: 'comments',
                include: [UserModel],
              },
            ],
          },
          {
            model: UserModel,
          },
        ],
        order: orderByFilter(asc, desc) ?? [['createdAt', 'DESC']],
        limit: limit ?? 20,
        offset: offset ?? 0,
      });

      return {
        count,
        rows,
        limit: limit ?? 20,
        offset: offset ?? 0,
      };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async createOneComment(
    userId: number,
    postId: number,
    body: CreateCommentDTO,
  ) {
    const { message, parentCommentId } = body;

    try {
      const findPost = await this.postModel.findByPk(postId);

      if (!findPost) {
        return new NotFoundException('Post not found');
      }

      if (parentCommentId) {
        // * Find which post do the parentCommentId belongs to, and select that postId
        const parentComment = await this.commentModel.findOne({
          where: {
            commentId: parentCommentId,
          },
        });

        // * If postId do not match the parentCommentId's postId, return 400
        if (!parentComment) {
          return new NotFoundException('Parent comment not found');
        }

        if (parentComment.postId !== postId) {
          return new BadRequestException(
            "Parent comment doesn't belong to the specified post",
          );
        }
      }

      await this.commentModel.create({
        message,
        userId,
        postId,
        parentCommentId: !parentCommentId ? null : parentCommentId,
      });

      return HttpStatus.CREATED;
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async deleteOneComment(commentId: number) {
    try {
      await this.commentModel.destroy({
        where: {
          commentId,
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
