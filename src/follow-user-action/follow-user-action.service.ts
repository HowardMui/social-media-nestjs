import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';
import { GetMeFollowersQueryParams, GetMeFollowingQueryParams } from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { UserFollowModel, UserModel } from 'src/models';
import { errorHandler } from 'src/error-handler';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class FollowUserActionService {
  constructor(
    private prisma: PrismaSrcService,
    private redis: RedisService,
    @InjectModel(UserFollowModel)
    private userFollowModel: typeof UserFollowModel,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
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
        await this.userFollowModel.create({
          followerId: currentUserId,
          followingId: wannaFollowId,
        });
      }

      // await this.prisma.$transaction(async (tx) => {
      //   await tx.user.update({
      //     where: {
      //       userId: wannaFollowId,
      //     },
      //     data: {
      //       followers: {
      //         connect: {
      //           userId: currentUserId,
      //         },
      //       },
      //     },
      //   });
      //   const redisKeys = await this.redis.getMultipleKeyPattern(
      //     `gmfi-u:${currentUserId}`,
      //   );
      // console.log(redisKeys)
      // if (redisKeys.length > 0) {
      //   await Promise.all(
      //     redisKeys.map(async (key) => {
      //       await this.redis.deleteRedisKeys(key);
      //     }),
      //   );
      // }
      //   return HttpStatus.CREATED;
      // });

      return {
        status: HttpStatus.CREATED,
      };
    } catch (err) {
      console.log(err);
      // if (err.code === 'P2016') {
      //   throw new NotFoundException('User do not exist');
      // }
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
      // * gmfe = get my followers
      // const cacheFollowersData = await this.redis.getRedisValue<
      //   ListResponse<GetMeFollowersResponse>
      // >(`gmfe${formatDataToRedis<GetMeFollowersQueryParams>(query, userId)}`);
      // if (cacheFollowersData) {
      //   return cacheFollowersData;
      // } else {
      // const [totalFollowers, followersList] = await this.prisma.$transaction([
      //   this.prisma.user.findUnique({
      //     where: {
      //       userId,
      //     },
      //     select: {
      //       _count: {
      //         select: {
      //           followers: true,
      //         },
      //       },
      //     },
      //   }),
      //   this.prisma.user.findUnique({
      //     where: {
      //       userId,
      //     },
      //     select: {
      //       followers: {
      //         skip: offset || 0,
      //         take: limit || 20,
      //         include: {
      //           followers: true,
      //         },
      //       },
      //     },
      //   }),
      // ]);
      // * Add isFollowing boolean into return list
      // const formatFollowersList = followersList.followers.map(
      //   ({ followers, ...restFollower }) => {
      //     const isFollowing = followers.some(
      //       (eachUserInFollowers) => eachUserInFollowers.userId === userId,
      //     );
      //     return {
      //       ...restFollower,
      //       isFollowing,
      //     };
      //   },
      // );

      // const response = {
      //   count: totalFollowers._count.followers,
      //   rows: formatFollowersList,
      //   limit: limit ?? 0,
      //   offset: offset ?? 20,
      // };

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

      // await this.redis.setRedisValue(
      //   `gmfe${formatDataToRedis<GetMeFollowersQueryParams>(query, userId)}`,
      //   response,
      // );
      return response;
      // }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserFollowing(userId: number, query: GetMeFollowingQueryParams) {
    const { limit, offset } = query;
    try {
      // * gmfi = get my following
      // const cacheFollowingData = await this.redis.getRedisValue<
      //   ListResponse<GetMeFollowingResponse>
      // >(`gmfi${formatDataToRedis<GetMeFollowingQueryParams>(query, userId)}`);
      // if (cacheFollowingData) {
      //   return cacheFollowingData;
      // } else {
      // const [totalFollowing, followingList] = await this.prisma.$transaction([
      //   // * Find one and find total
      //   this.prisma.user.findUnique({
      //     where: {
      //       userId,
      //     },
      //     select: {
      //       _count: {
      //         select: {
      //           following: true,
      //         },
      //       },
      //     },
      //   }),
      //   this.prisma.user.findUnique({
      //     where: {
      //       userId,
      //     },
      //     select: {
      //       following: {
      //         skip: offset || 0,
      //         take: limit || 20,
      //         include: {
      //           followers: true,
      //         },
      //       },
      //     },
      //   }),
      // ]);

      // // * Add isFollowing boolean into return list
      // const transformFollowingList = followingList.following.map(
      //   ({ followers, ...restFollower }) => {
      //     const isFollowing = followers.some(
      //       (eachUserInFollowers) => eachUserInFollowers.userId === userId,
      //     );
      //     return {
      //       ...restFollower,
      //       isFollowing,
      //     };
      //   },
      // );

      // const response = {
      //   count: totalFollowing._count.following,
      //   rows: transformFollowingList,
      //   limit: limit ?? 0,
      //   offset: offset ?? 20,
      // };

      const user = await this.userModel.findAndCountAll({
        include: [
          {
            model: UserFollowModel,
            as: 'followers',
            where: {
              followerId: userId,
            },
          },
        ],
      });

      return user;

      // await this.redis.setRedisValue(
      //   `gmfi${formatDataToRedis<GetMeFollowingQueryParams>(query, userId)}`,
      //   response,
      // );
      // return response;
      // }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
