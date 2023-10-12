import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { errorHandler } from 'src/error-handler';
import { formatDataToRedis } from 'src/helper';
import { GetMeLikedQueryParams } from 'src/me/dto';
import { LikePostModel, PostModel, UserModel } from 'src/models';
import { BookmarkPostModel } from 'src/models/bookmarkPost.model';
import { RePostModel } from 'src/models/userPostAndRePost.mode';
import { PostResponse } from 'src/post/dto';
import { RedisService } from 'src/redis/redis.service';
import { ListResponse, RedisKey } from 'src/types';

@Injectable()
export class LikePostService {
  constructor(
    private redis: RedisService,
    @InjectModel(LikePostModel)
    private likedPostModel: typeof LikePostModel,
    @InjectModel(PostModel)
    private postModel: typeof PostModel,
  ) {}
  private readonly logger = new Logger(LikePostService.name);

  async getMeLikedPostList(query: GetMeLikedQueryParams, userId: number) {
    const { limit, offset } = query;
    try {
      const cachedLikedPostData = await this.redis.getRedisValue<
        ListResponse<PostResponse>
      >(
        formatDataToRedis<GetMeLikedQueryParams>({
          filter: query,
          keyword: RedisKey.讚好,
          userId,
        }),
      );
      if (cachedLikedPostData) {
        return cachedLikedPostData;
      } else {
        const { count, rows } = await this.postModel.findAndCountAll({
          attributes: {
            include: [
              [
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM rePosts WHERE rePosts.postId = PostModel.postId)`,
                ),
                'rePostCount',
              ],
              [
                Sequelize.literal(
                  `(SELECT COUNT(*) FROM likePost WHERE likePost.postId = PostModel.postId)`,
                ),
                'likeCount',
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
              model: LikePostModel,
              where: { userId },
              attributes: [],
            },
            {
              model: RePostModel,
              attributes: [],
            },
            {
              model: BookmarkPostModel,
              attributes: [],
            },
            {
              model: UserModel,
            },
          ],
          group: ['PostModel.postId'],
        });

        const response = {
          count: count.length,
          rows,
          limit: limit ?? 0,
          offset: offset ?? 20,
        };
        await this.redis.setRedisValue(
          formatDataToRedis<GetMeLikedQueryParams>({
            filter: query,
            keyword: RedisKey.讚好,
            userId,
          }),
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async likeAPostByUser(postId: number, userId: number) {
    try {
      const findUserLikedPost = await this.likedPostModel.findOne({
        where: {
          postId,
          userId,
        },
      });

      if (findUserLikedPost) {
        return new BadRequestException('Already liked');
      } else {
        await this.likedPostModel.create({
          postId,
          userId,
        });
        const redisKeys = await this.redis.getRedisKeysPattern(
          `u:${userId}-${RedisKey.讚好}`,
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

  async unLikeAPost(postId: number, userId: number) {
    try {
      const findUserLikedPost = await this.likedPostModel.findOne({
        where: {
          postId,
          userId,
        },
      });

      if (findUserLikedPost) {
        await this.likedPostModel.destroy({
          where: {
            postId,
            userId,
          },
        });
        const redisKeys = await this.redis.getRedisKeysPattern(
          `u:${userId}-${RedisKey.讚好}`,
        );
        if (redisKeys.length > 0) {
          await Promise.all(
            redisKeys.map(async (key) => {
              await this.redis.deleteRedisKeys(key);
            }),
          );
        }
      } else {
        return new BadRequestException('Post or likePost does not exist');
      }
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
