import { Module } from '@nestjs/common';
import { LikePostController } from './like-post.controller';
import { LikePostService } from './like-post.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [LikePostController],
  providers: [LikePostService],
})
export class LikePostModule {}
