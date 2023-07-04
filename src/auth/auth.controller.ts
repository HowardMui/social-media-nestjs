import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Response } from 'express';

@Controller('auths')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signin')
  login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('signup')
  signup(@Body() dto: AuthDto): any {
    return this.authService.signup(dto);
  }
}
