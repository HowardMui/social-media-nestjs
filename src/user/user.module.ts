import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RolesGuard } from 'src/auth/role-guard/roles.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, RolesGuard],
})
export class UserModule {}
