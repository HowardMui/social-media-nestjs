import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TagModel, UserModel } from 'src/models';

@Module({
  imports: [SequelizeModule.forFeature([UserModel, TagModel])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
