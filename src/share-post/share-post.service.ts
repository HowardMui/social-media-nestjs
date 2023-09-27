import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SharePostService {
  constructor(private prisma: PrismaSrcService, private redis: RedisService) {}

  async rePostAPostToCurrentUserBlog(postId: number, userId: number) {
    try {
      await this.prisma.$transaction([
        this.prisma.userRePost.create({
          data: {
            postId,
            userId,
          },
        }),
        // * Update the updatedAt field in the Post model
        this.prisma.post.update({
          where: {
            postId,
          },
          data: {
            updatedAt: new Date(),
          },
        }),
      ]);
      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2002') {
        throw new BadRequestException('Already rePosted by user');
      } else {
        throw err;
      }
    }
  }

  async cancelRePostAPost(postId: number, userId: number) {
    try {
      await this.prisma.$transaction([
        this.prisma.userRePost.delete({
          where: {
            postId_userId: {
              postId,
              userId,
            },
          },
        }),
        // * Update the updatedAt field in the Post model
        this.prisma.post.update({
          where: {
            postId,
          },
          data: {
            updatedAt: new Date(),
          },
        }),
      ]);
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('rePost or post record do not exist');
      } else {
        throw err;
      }
    }
  }
}
