import { Module } from '@nestjs/common';
import { LikePostController } from './like-post.controller';
import { LikePostService } from './like-post.service';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { LikePostModel } from 'src/models';

@Module({
  imports: [RedisModule, SequelizeModule.forFeature([LikePostModel])],
  controllers: [LikePostController],
  providers: [LikePostService],
})
export class LikePostModule {}
