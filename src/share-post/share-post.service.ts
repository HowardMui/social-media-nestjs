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
      await this.prisma.$transaction(async (tx) => {
        // const createRePost = await tx.userRePost.create({
        //   data: {
        //     postId,
        //     userId,
        //   },
        //   include: {
        //     post: {
        //       include: {
        //         postOrderByUser: true,
        //       },
        //     },
        //   },
        // });

        // * Create the post order in userPostOrder table
        // if (createRePost) {
        await tx.userPostOrder.create({
          data: {
            rePostId: postId,
            userId,
          },
        });
        // }
      });
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

  async cancelRePostAPost(rePostId: number, userId: number) {
    try {
      // await this.prisma.$transaction(async (tx) => {
      // const deletedRePost = await this.prisma.userRePost.delete({
      //   where: {
      //     postId_userId: {
      //       postId: rePostId,
      //       userId,
      //     },
      //   },
      //   include: {
      //     post: {
      //       include: {
      //         postOrderByUser: true,
      //       },
      //     },
      //   },
      // });
      // console.log('deletedRePost in cancelRePostAPost',deletedRePost)
      // * Delete the post order in userPostOrder table
      // if (deletedRePost) {
      await this.prisma.userPostOrder.deleteMany({
        where: {
          rePostId,
          userId,
          // postId_repostId_userId_id:{
          //   postId,
          //   userId,
          // }
          // postId_userId: {
          //   postId: deletedRePost.postId,
          //   userId: deletedRePost.userId,
          // },
        },
      });
      // }
      // });
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
