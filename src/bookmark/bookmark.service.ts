import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaSrcService, private redis: RedisService) {}

  async bookmarkOnePost(postId: number, userId: number) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.userBookmark.create({
          data: {
            postId,
            userId,
          },
          select: {
            post: true,
          },
        });
        const redisKeys = await this.redis.getRedisKeysPattern('gmpb');
        if (redisKeys.length > 0) {
          await Promise.all(
            redisKeys.map(async (key) => {
              await this.redis.deleteRedisKeys(key);
            }),
          );
        }
        return { status: HttpStatus.CREATED };
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Already bookmarked by user');
    }
  }

  async deleteOneBookmark(postId: number, userId: number) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.userBookmark.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        });
        const redisKeys = await this.redis.getRedisKeysPattern('gmpb');
        if (redisKeys.length > 0) {
          await Promise.all(
            redisKeys.map(async (key) => {
              await this.redis.deleteRedisKeys(key);
            }),
          );
        }
        return { status: HttpStatus.OK };
      });
    } catch (err) {
      console.log(err);
    }
  }
}
