import { Module } from '@nestjs/common';
import { FollowUserActionService } from './follow-user-action.service';
import { FollowUserActionController } from './follow-user-action.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [FollowUserActionService],
  controllers: [FollowUserActionController],
})
export class FollowUserActionModule {}
