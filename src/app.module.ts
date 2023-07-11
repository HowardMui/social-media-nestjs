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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
