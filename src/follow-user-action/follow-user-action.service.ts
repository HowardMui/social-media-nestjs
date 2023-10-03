import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class FollowUserActionService {
  constructor(private prisma: PrismaSrcService, private redis: RedisService) {}
  async followOneUser(wannaFollowId: number, currentUserId: number) {
    try {
      if (wannaFollowId === currentUserId) {
        return new BadRequestException('Cannot follow yourself');
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            userId: wannaFollowId,
          },
          data: {
            followers: {
              connect: {
                userId: currentUserId,
              },
            },
          },
        });
        const redisKeys = await this.redis.getMultipleKeyPattern(`gmfi-u:${currentUserId}`);
        // console.log(redisKeys)
        // if (redisKeys.length > 0) {
        //   await Promise.all(
        //     redisKeys.map(async (key) => {
        //       await this.redis.deleteRedisKeys(key);
        //     }),
        //   );
        // }
        return HttpStatus.CREATED;
      });
    } catch (err) {
      console.log(err);
      if (err.code === 'P2016') {
        throw new NotFoundException('User do not exist');
      }
    }
  }

  async unFollowOneUser(wannaUnFollowId: number, currentUserId: number) {
    try {
      if (wannaUnFollowId === currentUserId) {
        return new BadRequestException('Cannot unfollow yourself');
      }

      await this.prisma.user.update({
        where: {
          userId: wannaUnFollowId,
        },
        data: {
          followers: {
            disconnect: {
              userId: currentUserId,
            },
          },
        },
      });
      return HttpStatus.OK;
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('User do not exist');
      }
    }
  }
}
