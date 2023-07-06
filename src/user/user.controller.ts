import { Controller, Delete, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(AuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get('')
  getAllUser() {
    return this.userService.getUserList();
  }

  @Delete()
  deleteAllUser() {
    return this.userService.deleteAllUser();
  }
}
