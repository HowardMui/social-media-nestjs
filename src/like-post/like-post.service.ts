import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class LikePostService {
  constructor(private prisma: PrismaSrcService, private redis: RedisService) {}
  private readonly logger = new Logger(LikePostService.name);

  async likeAPostByUser(postId: number, userId: number) {
    try {
      await this.prisma.userLikedPost.create({
        data: {
          postId,
          userId,
        },
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      if (
        err.code === 'P2003' ||
        err.code === 'P2025' ||
        err.code === 'P2016'
      ) {
        throw new NotFoundException('Post do not exist');
      } else if (err.code === 'P2002') {
        throw new BadRequestException('Already liked by user');
      } else {
        throw err;
      }
    }
  }

  async unLikeAPost(postId: number, userId: number) {
    try {
      await this.prisma.userLikedPost.delete({
        where: {
          userId_postId: {
            postId,
            userId,
          },
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('Like or post record do not exist');
      } else {
        throw err;
      }
    }
  }
}
