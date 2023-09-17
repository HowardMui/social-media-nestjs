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
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ThrottlerModule,
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 4,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 10,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
