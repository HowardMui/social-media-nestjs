import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Response } from 'express';
import { ApiBody, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auths')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBody({ type: AuthDto })
  @ApiForbiddenResponse()
  @Post('signin')
  login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('signup')
  signup(@Body() dto: AuthDto): any {
    return this.authService.signup(dto);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
