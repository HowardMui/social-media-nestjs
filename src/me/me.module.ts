import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel, UserLogModel } from 'src/models';

@Module({
  imports: [
    JwtModule.register({}),
    RedisModule,
    SequelizeModule.forFeature([UserModel, UserLogModel]),
  ],
  controllers: [MeController],
  providers: [MeService, RolesGuard],
})
export class MeModule {}
