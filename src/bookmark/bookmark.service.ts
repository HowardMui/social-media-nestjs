import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { errorHandler } from 'src/error-handler';
import { formatDataToRedis } from 'src/helper';
import { GetMeBookmarkedQueryParams } from 'src/me/dto';
import { LikePostModel, PostModel, TagModel, UserModel } from 'src/models';
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
      // const cachedBookmarkPostData = await this.redis.getRedisValue<
      //   ListResponse<PostResponse>
      // >(
      //   formatDataToRedis<GetMeBookmarkedQueryParams>({
      //     filter: query,
      //     keyword: RedisKey.書籤,
      //     userId,
      //   }),
      // );
      // if (cachedBookmarkPostData) {
      //   return cachedBookmarkPostData;
      // } else {

      const { count, rows } = await this.postModel.findAndCountAll({
        distinct: true,
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_bookmarkPost AS bp WHERE bp.postId = PostModel.postId)`,
              ),
              'bookmarkedCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_rePost AS rp WHERE rp.postId = PostModel.postId)`,
              ),
              'rePostedCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_likePost AS lp WHERE lp.postId = PostModel.postId)`,
              ),
              'likedCount',
            ],
          ],
        },
        include: [
          {
            model: UserModel,
            where: { userId },
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
            model: TagModel,
            attributes: ['tagId', 'tagName'],
            through: { attributes: [] },
          },
          {
            model: UserModel,
            as: 'user',
          },
        ],
        order: [
          [
            { model: UserModel, as: 'bookmarkedPostByUser' },
            BookmarkPostModel,
            'createdAt',
            'desc',
          ],
        ],
      });

      const response = {
        count: count,
        rows,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      // await this.redis.setRedisValue(
      //   formatDataToRedis<GetMeBookmarkedQueryParams>({
      //     filter: query,
      //     keyword: RedisKey.書籤,
      //     userId,
      //   }),
      //   response,
      // );

      return response;
      // }
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
