import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostModel, TagModel, UserModel } from 'src/models';

@Module({
  imports: [
    RedisModule,
    SequelizeModule.forFeature([UserModel, PostModel, TagModel]),
  ],
  providers: [RecommendationService],
  controllers: [RecommendationController],
})
export class RecommendationModule {}
