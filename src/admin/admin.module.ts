import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminAuthModel, AdminModel, UserLogModel } from 'src/models';

@Module({
  imports: [
    JwtModule.register({}),
    SequelizeModule.forFeature([AdminModel, AdminAuthModel, UserLogModel]),
  ],
  providers: [AdminService, RolesGuard],
  controllers: [AdminController],
})
export class AdminModule {}
