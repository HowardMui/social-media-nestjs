import { Module } from '@nestjs/common';
import { SequelizeSrcService } from './sequelize-src.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  AdminAuthModel,
  AdminModel,
  CommentModel,
  LikePostModel,
  PostModel,
  PostTagModel,
  TagModel,
  UserAuthModel,
  UserFollowModel,
  UserLikeCommentModel,
  UserLogModel,
  UserModel,
} from 'src/models';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RePostModel } from 'src/models/userPostAndRePost.mode';
import { BookmarkPostModel } from 'src/models/bookmarkPost.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          dialect: config.get('MYSQL_DIALECT'),
          host: config.get('MYSQL_HOST'),
          port: config.get('MYSQL_PORT'),
          username: config.get('MYSQL_USERNAME'),
          password: config.get('MYSQL_PASSWORD'),
          database: config.get('MYSQL_DATABASE'),
          dialectOptions: {
            ssl: {
              rejectUnauthorized: true,
            },
          },
          autoLoadModels: config.get('DEV_STAGE') ? true : false,
          synchronize: true,
          models: [
            UserModel,
            UserAuthModel,
            UserLogModel,
            UserFollowModel,
            PostModel,
            RePostModel,
            LikePostModel,
            BookmarkPostModel,
            TagModel,
            CommentModel,
            PostTagModel,
            AdminModel,
            AdminAuthModel,
            UserLikeCommentModel,
          ],
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [SequelizeSrcService],
})
export class SequelizeSrcModule {}
