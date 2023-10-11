import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { errorHandler } from 'src/error-handler';
import { LikePostModel } from 'src/models';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class LikePostService {
  constructor(
    private prisma: PrismaSrcService,
    private redis: RedisService,
    @InjectModel(LikePostModel)
    private likedPostModel: typeof LikePostModel,
  ) {}
  private readonly logger = new Logger(LikePostService.name);

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
