import { Module } from '@nestjs/common';
import { FollowUserActionService } from './follow-user-action.service';
import { FollowUserActionController } from './follow-user-action.controller';

@Module({
  providers: [FollowUserActionService],
  controllers: [FollowUserActionController]
})
export class FollowUserActionModule {}
