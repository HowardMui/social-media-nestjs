import { Module } from '@nestjs/common';
import { SharePostService } from './share-post.service';
import { SharePostController } from './share-post.controller';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { RePostModel } from 'src/models/userPostAndRePost.mode';

@Module({
  imports: [RedisModule, SequelizeModule.forFeature([RePostModel])],
  providers: [SharePostService],
  controllers: [SharePostController],
})
export class SharePostModule {}
