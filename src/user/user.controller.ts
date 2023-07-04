import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    // const userId = req.user.userId
    // return 'get me info';
  }
}
