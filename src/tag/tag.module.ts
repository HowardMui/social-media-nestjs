import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostTagModel, TagModel } from 'src/models';

@Module({
  imports: [SequelizeModule.forFeature([TagModel, PostTagModel])],
  providers: [TagService],
  controllers: [TagController],
})
export class TagModule {}
