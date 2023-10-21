import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentModel, PostModel } from 'src/models';
import { CommentController, MeCommentController } from './controller';
import { CommentService, MeCommentService } from './services';

@Module({
  imports: [SequelizeModule.forFeature([CommentModel, PostModel])],
  providers: [CommentService, MeCommentService],
  controllers: [CommentController, MeCommentController],
})
export class CommentModule {}
