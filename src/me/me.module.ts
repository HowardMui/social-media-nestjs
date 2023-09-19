import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/auth/strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MeController],
  providers: [MeService, RolesGuard, JwtStrategy],
})
export class MeModule {}
