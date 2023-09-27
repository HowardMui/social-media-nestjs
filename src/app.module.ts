import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaSrcModule } from './prisma-src/prisma-src.module';
import { ConfigModule } from '@nestjs/config';
import { MeModule } from './me/me.module';
import { AdminModule } from './admin/admin.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { FileModule } from './file/file.module';
import { TagModule } from './tag/tag.module';
import { SearchModule } from './search/search.module';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { LikePostModule } from './like-post/like-post.module';
import { SharePostModule } from './share-post/share-post.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    UserModule,
    PrismaSrcModule,
    MeModule,
    AdminModule,
    PostModule,
    CommentModule,
    BookmarkModule,
    RecommendationModule,
    FileModule,
    TagModule,
    SearchModule,
    CronjobsModule,
    RateLimitModule,
    LikePostModule,
    SharePostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
