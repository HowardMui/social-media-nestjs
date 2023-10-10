import { Module } from '@nestjs/common';
import { FollowUserActionService } from './follow-user-action.service';
import {
  FollowUserActionController,
  MeFollowController,
} from './follow-user-action.controller';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserFollowModel, UserModel } from 'src/models';

@Module({
  imports: [
    RedisModule,
    SequelizeModule.forFeature([UserModel, UserFollowModel]),
  ],
  providers: [FollowUserActionService],
  controllers: [FollowUserActionController, MeFollowController],
})
export class FollowUserActionModule {}
