import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostModel } from 'src/models';

@Module({
  imports: [RedisModule, SequelizeModule.forFeature([PostModel])],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
