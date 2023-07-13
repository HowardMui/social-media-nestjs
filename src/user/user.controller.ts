import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserQueryParams, UpdateUserDTO } from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { GetReqReturnType } from 'src/types';
import { User } from '@prisma/client';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all users. Admin Only' })
  getAllUser(
    @Query() query: GetUserQueryParams,
  ): Promise<GetReqReturnType<User>> {
    return this.userService.getUserList(query);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update one user. Admin Only' })
  updateOneUser(@Param('userId') userId: number, @Body() dto: UpdateUserDTO) {
    return this.updateOneUser(userId, dto);
  }

  @Delete(':userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete one user. Admin Only' })
  deleteOneUser(@Param('userId') userId: number) {
    return this.userService.deleteOneUser(userId);
  }
}
