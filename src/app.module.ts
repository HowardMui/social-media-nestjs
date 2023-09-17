import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaSrcModule } from './prisma-src/prisma-src.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

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
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        console.log('config', config);
        const store = await redisStore({
          socket: {
            host: 'redis-18728.c114.us-east-1-4.ec2.cloud.redislabs.com',
            port: 18728,
          },
          // username: 'default',
          password: 'OHUlWH2rRmcLLCjgtEJ12gfthlkN0npo',
          ttl: 60, // 60 seconds
        });

        return {
          store: store as unknown as CacheStore,
        };
      },
      inject: [ConfigService],
      isGlobal: true,
      // store: redisStore,
      // host: 'localhost',
      // port: 6379,
    }),
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
