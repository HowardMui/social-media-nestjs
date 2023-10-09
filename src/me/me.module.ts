import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategy';
import { RedisModule } from 'src/redis/redis.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from 'src/models';
import { UserAuthModel } from 'src/models/userAuth.model';

@Module({
  imports: [
    JwtModule.register({}),
    RedisModule,
    SequelizeModule.forFeature([UserModel, UserAuthModel]),
  ],
  controllers: [MeController],
  providers: [MeService, RolesGuard, JwtStrategy],
})
export class MeModule {}
