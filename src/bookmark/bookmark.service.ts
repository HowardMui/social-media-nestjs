import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { errorHandler } from 'src/error-handler';
import { formatDataToRedis } from 'src/helper';
import { GetMeBookmarkedQueryParams } from 'src/me/dto';
import { LikePostModel, PostModel, UserModel } from 'src/models';
import { BookmarkPostModel } from 'src/models/bookmarkPost.model';
import { RePostModel } from 'src/models/userPostAndRePost.mode';
import { PostResponse } from 'src/post/dto';
import { RedisService } from 'src/redis/redis.service';
import { ListResponse, RedisKey } from 'src/types';

@Injectable()
export class BookmarkService {
  constructor(
    private redis: RedisService,
    @InjectModel(PostModel)
    private postModel: typeof PostModel,
    @InjectModel(BookmarkPostModel)
    private bookmarkPostModel: typeof BookmarkPostModel,
  ) {}

  async getAllMeBookmarkList(
    query: GetMeBookmarkedQueryParams,
    userId: number,
  ) {
    const { limit, offset } = query;
    try {
      const cachedBookmarkPostData = await this.redis.getRedisValue<
        ListResponse<PostResponse>
      >(
        formatDataToRedis<GetMeBookmarkedQueryParams>({
          filter: query,
          keyword: RedisKey.書籤,
          userId,
        }),
      );
      if (cachedBookmarkPostData) {
        return cachedBookmarkPostData;
      } else {
        const { count, rows } = await this.postModel.findAndCountAll({
          attributes: {
            include: [
              [
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM rePosts WHERE rePosts.postId = PostModel.postId)`,
                ),
                'rePostedCount',
              ],
              [
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM likePost WHERE likePost.postId = PostModel.postId)`,
                ),
                'likedCount',
              ],
              [
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM bookmarkPost WHERE bookmarkPost.postId = PostModel.postId)`,
                ),
                'bookmarkedCount',
              ],
            ],
          },
          include: [
            {
              model: BookmarkPostModel,
              where: { userId },
              attributes: [],
            },
            {
              model: LikePostModel,
              attributes: [],
            },
            {
              model: RePostModel,
              attributes: [],
            },
            {
              model: UserModel,
            },
          ],
          group: ['bookmarkedPostByUser.id'],
        });

        const response = {
          count: count.length,
          rows,
          limit: limit ?? 0,
          offset: offset ?? 20,
        };

        await this.redis.setRedisValue(
          formatDataToRedis<GetMeBookmarkedQueryParams>({
            filter: query,
            keyword: RedisKey.書籤,
            userId,
          }),
          response,
        );

        return response;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async bookmarkOnePost(postId: number, userId: number) {
    try {
      const findBookmarkedPost = await this.bookmarkPostModel.findOne({
        where: {
          postId,
          userId,
        },
      });

      if (findBookmarkedPost) {
        return new BadRequestException('Already bookmarked');
      } else {
        await this.bookmarkPostModel.create({
          postId,
          userId,
        });
        const redisKeys = await this.redis.getRedisKeysPattern(
          `u:${userId}-${RedisKey.書籤}`,
        );
        if (redisKeys.length > 0) {
          await Promise.all(
            redisKeys.map(async (key) => {
              await this.redis.deleteRedisKeys(key);
            }),
          );
        }
      }
      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async deleteOneBookmark(postId: number, userId: number) {
    try {
      const findBookmarkedPost = await this.bookmarkPostModel.findOne({
        where: {
          postId,
          userId,
        },
      });

      if (findBookmarkedPost) {
        await this.bookmarkPostModel.destroy({
          where: {
            postId,
            userId,
          },
        });
        const redisKeys = await this.redis.getRedisKeysPattern(
          `u:${userId}-${RedisKey.書籤}`,
        );
        if (redisKeys.length > 0) {
          await Promise.all(
            redisKeys.map(async (key) => {
              await this.redis.deleteRedisKeys(key);
            }),
          );
        }
      } else {
        return new BadRequestException(
          'Post or bookmarked post does not exist',
        );
      }

      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
