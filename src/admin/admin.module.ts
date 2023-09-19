import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';

@Module({
  imports: [JwtModule.register({})],
  providers: [AdminService, RolesGuard],
  controllers: [AdminController],
})
export class AdminModule {}
