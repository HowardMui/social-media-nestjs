import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentModel, PostModel, UserLikeCommentModel } from 'src/models';
import { CommentController, MeCommentController } from './controller';
import { CommentService, MeCommentService } from './services';

@Module({
  imports: [
    SequelizeModule.forFeature([CommentModel, PostModel, UserLikeCommentModel]),
  ],
  providers: [CommentService, MeCommentService],
  controllers: [CommentController, MeCommentController],
})
export class CommentModule {}
