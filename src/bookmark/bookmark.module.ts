import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import {
  BookmarkController,
  MeBookmarkedPostController,
} from './bookmark.controller';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostModel } from 'src/models';
import { BookmarkPostModel } from 'src/models/bookmarkPost.model';

@Module({
  imports: [
    RedisModule,
    SequelizeModule.forFeature([BookmarkPostModel, PostModel]),
  ],
  providers: [BookmarkService],
  controllers: [BookmarkController, MeBookmarkedPostController],
})
export class BookmarkModule {}
