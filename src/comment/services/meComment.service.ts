import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CommentModel, PostModel, TagModel, UserModel } from 'src/models';
import { GetMeCommentQueryParams } from '../dto';

@Injectable()
export class MeCommentService {
  constructor(
    @InjectModel(CommentModel)
    private commentModel: typeof CommentModel,
  ) {}

  async getAllMeComment(query: GetMeCommentQueryParams, userId: number) {
    const { limit, offset } = query;

    try {
      // * gmcl = get my comment list
      // const cachedMeCommentList = await this.redis.getRedisValue<
      //   ListResponse<GetMeCommentResponse>
      // >(`gmcl${formatDataToRedis<GetMeCommentQueryParams>(query, userId)}`);
      // if (cachedMeCommentList) {
      //   return cachedMeCommentList;
      // } else {
      // await this.redis.setRedisValue(
      //   `gmcl${formatDataToRedis<GetMeCommentQueryParams>(query, userId)}`,
      //   response,
      // );
      // return response;
      // }

      const { count, rows } = await this.commentModel.findAndCountAll({
        distinct: true,
        where: {
          userId,
        },
        include: [
          {
            model: PostModel,
            attributes: {
              include: [
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM user_bookmarkPost AS bp WHERE bp.postId = postId)`,
                  ),
                  'bookmarkedCount',
                ],
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM user_rePost AS rp WHERE rp.postId = postId)`,
                  ),
                  'rePostedCount',
                ],
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM user_likePost AS lp WHERE lp.postId = postId)`,
                  ),
                  'likedCount',
                ],
                [
                  Sequelize.literal(
                    `(COALESCE(
                        (SELECT 
                        JSON_ARRAYAGG(t.tagName)
                        FROM tag AS t INNER JOIN post_tag AS pt ON t.tagId = pt.tagId WHERE pt.postId = postId),
                        CAST('[]' AS JSON))
                        )`,
                  ),
                  'tags',
                ],
              ],
            },
            include: [
              {
                model: TagModel,
                attributes: [],
              },
              {
                model: UserModel,
                as: 'bookmarkedPostByUser',
                attributes: [],
              },
              {
                model: UserModel,
                as: 'likedPostByUser',
                attributes: [],
              },
              {
                model: UserModel,
                as: 'rePostedByUser',
                attributes: [],
              },
              {
                model: UserModel,
                as: 'user',
              },
            ],
          },
          {
            model: UserModel,
          },
          {
            model: CommentModel,
            as: 'parentComment',
            include: [UserModel],
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
        ],
      });
      return {
        count,
        rows,
        limit: limit ?? 20,
        offset: offset ?? 0,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
