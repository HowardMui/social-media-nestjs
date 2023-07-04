import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';

import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiTags('user')
  // @UseGuards(AuthGuard)
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
