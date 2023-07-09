import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuthDto, AdminSigninDto } from './dto';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';

@ApiTags('admin me')
@Controller('admins/me')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Auth ------------------------------------------------------------------------------------

  @Post('signin')
  @ApiOperation({ summary: 'Admin Password Sign In' })
  adminSignin(
    @Body() dto: AdminSigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminService.adminSignin(dto, res);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Admin Password Sign up' })
  signup(@Body() dto: AdminAuthDto): any {
    return this.adminService.adminSignup(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Admin me logout' })
  logout(@Res() res: Response) {
    return this.adminService.adminlogout(res);
  }

  // Admin Action ------------------------------------------------------------------------------------

  @Get('')
  @ApiOperation({ summary: 'Get Current Admin Profile, Admin Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  getAdminProfile(@Req() req: Request) {
    return req.user;
  }
}
