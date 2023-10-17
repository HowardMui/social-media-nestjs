import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { errorHandler } from 'src/error-handler';
import { RePostModel } from 'src/models/userPostAndRePost.mode';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SharePostService {
  constructor(
    private prisma: PrismaSrcService,
    private redis: RedisService,
    @InjectModel(RePostModel)
    private rePostModel: typeof RePostModel,
  ) {}

  async rePostAPostToCurrentUserBlog(rePostId: number, userId: number) {
    try {
      // * Create the post order in userPostOrder table
      const findUserRePost = await this.rePostModel.findOne({
        where: {
          postId: rePostId,
          userId,
        },
      });

      if (findUserRePost) {
        return new BadRequestException('Already rePosted');
      } else {
        await this.rePostModel.create({
          postId: rePostId,
          userId,
        });
      }

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async cancelRePostAPost(rePostId: number, userId: number) {
    try {
      const findUserRePost = await this.rePostModel.findOne({
        where: {
          postId: rePostId,
          userId,
        },
      });

      if (findUserRePost) {
        await this.rePostModel.destroy({
          where: {
            postId: rePostId,
            userId,
          },
        });
      } else {
        return new BadRequestException('Post or rePost do not exist');
      }
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
