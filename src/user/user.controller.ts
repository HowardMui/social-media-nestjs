import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UpdateUserDTO } from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(AuthGuard)
  // @UseGuards(AuthGuard('jwt'))
  // @Get('me')
  // getProfile(@Req() req: Request) {
  //   return req.user;
  // }

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all users, Admin Only' })
  getAllUser() {
    return this.userService.getUserList();
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Patch()
  // updateOneUser(@Param('userId') userId: number, @Body() dto: UpdateUserDTO) {
  //   return this.updateOneUser(userId, dto);
  // }

  @Delete()
  deleteAllUser() {
    return this.userService.deleteAllUser();
  }
}
