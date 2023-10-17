import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';
import {
  GetMeFollowersQueryParams,
  GetMeFollowingQueryParams,
  GetMeFollowingResponse,
} from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserFollowModel, UserModel } from 'src/models';
import { errorHandler } from 'src/error-handler';
import { Sequelize } from 'sequelize-typescript';
import { ListResponse } from 'src/types';
import { formatDataToRedis } from 'src/helper';

@Injectable()
export class FollowUserActionService {
  constructor(
    private prisma: PrismaSrcService,
    private redis: RedisService,
    @InjectModel(UserFollowModel)
    private userFollowModel: typeof UserFollowModel,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    private sequelize: Sequelize,
  ) {}
  async followOneUser(wannaFollowId: number, currentUserId: number) {
    try {
      if (wannaFollowId === currentUserId) {
        return new BadRequestException('Cannot follow yourself');
      }

      const findFollow = await this.userFollowModel.findOne({
        where: {
          followerId: currentUserId,
          followingId: wannaFollowId,
        },
      });

      if (findFollow) {
        return new BadRequestException('Already followed user');
      } else {
        await this.sequelize.transaction(async (t) => {
          const transactionHost = { transaction: t };
          await this.userFollowModel.create(
            {
              followerId: currentUserId,
              followingId: wannaFollowId,
            },
            transactionHost,
          );
          const redisKeys = await this.redis.getRedisKeysPattern(
            `u:${currentUserId}-gmfi`,
          );
          if (redisKeys.length > 0) {
            await Promise.all(
              redisKeys.map(async (key) => {
                await this.redis.deleteRedisKeys(key);
              }),
            );
          }
          return HttpStatus.CREATED;
        });
      }
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async unFollowOneUser(wannaUnFollowId: number, currentUserId: number) {
    try {
      if (wannaUnFollowId === currentUserId) {
        return new BadRequestException('Cannot unfollow yourself');
      }

      const user = await this.userModel.findByPk(wannaUnFollowId);

      if (user) {
        await this.userFollowModel.destroy({
          where: {
            followerId: currentUserId,
            followingId: wannaUnFollowId,
          },
        });
        const redisKeys = await this.redis.getRedisKeysPattern(
          `u:${currentUserId}-gmfi`,
        );
        if (redisKeys.length > 0) {
          await Promise.all(
            redisKeys.map(async (key) => {
              await this.redis.deleteRedisKeys(key);
            }),
          );
        }
      } else {
        return new NotFoundException('User not exist');
      }

      return HttpStatus.OK;
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async getUserFollowers(userId: number, query: GetMeFollowersQueryParams) {
    const { limit, offset } = query;

    try {
      // ! Not to use redis here, gmfe = get my followers
      const { count, rows } = await this.userModel.findAndCountAll({
        attributes: {
          include: [
            [
              Sequelize.literal(`CASE WHEN (
                SELECT COUNT(*)
                FROM userFollows AS uf1
                INNER JOIN userFollows AS uf2 ON uf1.followerId = uf2.followingId
                WHERE uf1.followingId = UserModel.userId AND uf2.followerId = UserModel.userId
              ) > 0 THEN "TRUE" ELSE "FALSE" END`),
              'isFollowing',
            ],
          ],
        },
        include: [
          {
            model: UserFollowModel,
            as: 'following',
            where: {
              followingId: userId,
            },
            attributes: [],
          },
        ],
        limit: limit ?? 20,
        offset: offset ?? 0,
      });

      const response = {
        count,
        rows,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserFollowing(userId: number, query: GetMeFollowingQueryParams) {
    const { limit, offset } = query;
    try {
      // * gmfi = get my following
      const cacheFollowingData = await this.redis.getRedisValue<
        ListResponse<GetMeFollowingResponse>
      >(
        formatDataToRedis<GetMeFollowingQueryParams>({
          filter: query,
          keyword: 'gmfi',
          userId,
        }),
      );
      if (cacheFollowingData) {
        return cacheFollowingData;
      } else {
        const { count, rows } = await this.userModel.findAndCountAll({
          limit: limit ?? 20,
          offset: offset ?? 0,
          attributes: {
            include: [
              [
                Sequelize.literal(`CASE WHEN (
                SELECT COUNT(*)
                FROM userFollows AS uf1
                INNER JOIN userFollows AS uf2 ON uf1.followingId = uf2.followerId
                WHERE uf1.followerId = UserModel.userId AND uf2.followingId = UserModel.userId
              ) > 0 THEN "TRUE" ELSE "FALSE" END`),
                'isFollowing',
              ],
            ],
          },
          include: [
            {
              model: UserFollowModel,
              as: 'followers',
              where: {
                followerId: userId,
              },
              attributes: [],
            },
          ],
        });

        const response = {
          count,
          rows,
          limit: limit ?? 0,
          offset: offset ?? 20,
        };

        await this.redis.setRedisValue(
          formatDataToRedis<GetMeFollowingQueryParams>({
            filter: query,
            keyword: 'gmfi',
            userId,
          }),
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
