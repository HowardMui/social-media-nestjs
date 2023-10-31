import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { GetOneUserResponse, GetUserListQueryParams } from './dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import {
  formatListResponseObject,
  orderByFilter,
  returnAscOrDescInQueryParamsWithFilter,
} from 'src/helper';
import { GetUserPostEnum, GetUserPostQuery } from './dto/user-post.dto';
import { RedisService } from 'src/redis/redis.service';
import { InjectModel } from '@nestjs/sequelize';
import {
  CommentModel,
  LikePostModel,
  PostModel,
  TagModel,
  UserFollowModel,
  UserModel,
} from 'src/models';
import { Sequelize } from 'sequelize-typescript';

import { errorHandler } from 'src/error-handler';
import { userPostAndRePost, userPostAndRePostCount } from 'src/rawSQLquery';
import { Op } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    private redis: RedisService,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(PostModel)
    private postModel: typeof PostModel,
    @InjectModel(CommentModel)
    private commentModel: typeof CommentModel,
    private sequelize: Sequelize,
  ) {}

  // * User CRUD ------------------------------------------------------------------------------------------------

  async getUserList(query: GetUserListQueryParams) {
    const { limit, offset, userName, asc, desc } = query;

    const userNameCondition: {
      userName?: { [x: symbol]: string };
    } = {};

    if (userName) {
      userNameCondition.userName = { [Op.substring]: userName };
    }

    try {
      const { count, rows } = await this.userModel.findAndCountAll({
        distinct: true,
        limit: limit ?? 20,
        offset: offset ?? 0,
        where: userNameCondition,
        order: orderByFilter(asc, desc) ?? [['userId', 'DESC']],
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_follows AS uf WHERE uf.followerId = UserModel.userId)`,
              ),
              'followingCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_follows AS uf WHERE uf.followingId = UserModel.userId)`,
              ),
              'followerCount',
            ],
          ],
        },
        include: [
          {
            model: UserFollowModel,
            as: 'following',
            attributes: [],
          },
          {
            model: UserFollowModel,
            as: 'followers',
            attributes: [],
          },
        ],
      });

      return {
        count,
        rows,
        limit,
        offset,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async getOneUser(userId: number) {
    try {
      // * gupf = get user profile
      // const cacheUserProfile =
      //   await this.redis.getRedisValue<GetOneUserResponse>(`gupf-u:${userId}`);
      // if (cacheUserProfile) {
      //   return cacheUserProfile;
      // } else {
      const user = await this.userModel.findByPk(userId, {
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_follows AS uf WHERE uf.followerId = UserModel.userId)`,
              ),
              'followingCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_follows AS uf WHERE uf.followingId = UserModel.userId)`,
              ),
              'followerCount',
            ],
          ],
        },
        include: [
          {
            model: UserFollowModel,
            as: 'following',
            attributes: [],
          },
          {
            model: UserFollowModel,
            as: 'followers',
            attributes: [],
          },
        ],
      });

      return user;

      // await this.redis.setRedisValue(`gupf-u:${userId}`, {
      //   ...user,
      //   ...transformedUser,
      // });
      // return { ...user, ...transformedUser };
      // }
    } catch (err) {
      console.log(err);
    }
  }

  async getOneUserPostDetail(userId: number, query: GetUserPostQuery) {
    const { limit, offset, postType } = query;

    try {
      switch (postType) {
        // * Find user's post and rePosts
        case GetUserPostEnum.Posts:
        default:
          const response = await this.sequelize.query(
            userPostAndRePost({ userId, limit, offset }),
            {
              nest: true,
            },
          );

          const postCount = await this.sequelize.query(
            userPostAndRePostCount(userId),
            {
              plain: true,
            },
          );

          return {
            count: postCount.count,
            rows: response,
            limit: limit ?? 20,
            offset: offset ?? 0,
          };

        // * Find user liked post
        case GetUserPostEnum.Likes:
          const likePosts = await this.postModel.findAndCountAll({
            distinct: true,
            limit: limit ?? 20,
            offset: offset ?? 0,
            attributes: {
              include: [
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM user_rePost AS rp WHERE rp.postId = PostModel.postId)`,
                  ),
                  'rePostCount',
                ],
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM user_likePost AS lp WHERE lp.postId = PostModel.postId)`,
                  ),
                  'likedCount',
                ],
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM user_bookmarkPost AS bp WHERE bp.postId = PostModel.postId)`,
                  ),
                  'bookmarkedCount',
                ],
                [
                  Sequelize.literal(
                    `(COALESCE(
                  (SELECT
                  JSON_ARRAYAGG(t.tagName)
                  FROM tag AS t INNER JOIN post_tag AS pt ON t.tagId = pt.tagId WHERE pt.postId = PostModel.postId),
                  CAST('[]' AS JSON))
                  )`,
                  ),
                  'tags',
                ],
              ],
            },
            include: [
              {
                model: UserModel,
                where: { userId },
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
                as: 'bookmarkedPostByUser',
                attributes: [],
              },
              {
                model: TagModel,
                attributes: [],
              },
              {
                model: UserModel,
                as: 'user',
              },
            ],
            order: [
              [
                { model: UserModel, as: 'likedPostByUser' },
                LikePostModel,
                'createdAt',
                'desc',
              ],
            ],
          });

          return {
            count: likePosts.count,
            rows: likePosts.rows,
            limit: limit ?? 0,
            offset: offset ?? 20,
          };

        // * Find user replied post
        case GetUserPostEnum.Replies:
          const userReplies = await this.commentModel.findAndCountAll({
            distinct: true,
            limit: limit ?? 20,
            offset: offset ?? 0,
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
                as: 'user',
              },
              {
                model: CommentModel,
                as: 'parentComment',
                include: [{ model: UserModel, as: 'user' }],
              },
              {
                model: CommentModel,
                as: 'comments',
                attributes: {
                  include: [
                    [
                      Sequelize.literal(
                        `(SELECT COUNT(*) FROM user_likeComment AS ulc WHERE ulc.commentId = comments.commentId)`,
                      ),
                      'commentLikeCount',
                    ],
                  ],
                },
                include: [{ model: UserModel, as: 'user' }],
              },
            ],
          });
          return {
            count: userReplies.count,
            rows: userReplies.rows,
            limit: limit ?? 20,
            offset: offset ?? 0,
          };
      }
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async updateOneUser(userId: number, dto: UpdateUserDTO) {
    try {
      return await this.userModel.update(
        {
          ...dto,
        },
        {
          where: {
            userId,
          },
        },
      );
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async deleteOneUser(userId: number) {
    try {
      await this.userModel.destroy({
        where: {
          userId,
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
