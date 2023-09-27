import { Module } from '@nestjs/common';
import { SharePostService } from './share-post.service';
import { SharePostController } from './share-post.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SharePostService],
  controllers: [SharePostController],
})
export class SharePostModule {}
