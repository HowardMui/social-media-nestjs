import { Module } from '@nestjs/common';
import {
  LikePostController,
  MeLikedPostController,
} from './like-post.controller';
import { LikePostService } from './like-post.service';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { LikePostModel, PostModel } from 'src/models';

@Module({
  imports: [
    RedisModule,
    SequelizeModule.forFeature([LikePostModel, PostModel]),
  ],
  controllers: [LikePostController, MeLikedPostController],
  providers: [LikePostService],
})
export class LikePostModule {}
