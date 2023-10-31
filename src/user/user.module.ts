import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommentModel, PostModel, UserModel } from 'src/models';

@Module({
  imports: [
    RedisModule,
    SequelizeModule.forFeature([UserModel, PostModel, CommentModel]),
  ],
  controllers: [UserController],
  providers: [UserService, RolesGuard],
})
export class UserModule {}
