import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MeService } from './me.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UpdateUserProfileDTO, UserAuthDto } from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';

@ApiTags('me')
@Controller('me')
export class MeController {
  constructor(private userProfileService: MeService) {}

  // Auth ------------------------------------------------------------------------------------

  @ApiBody({ type: UserAuthDto })
  @ApiForbiddenResponse()
  @ApiOperation({ summary: 'User Sign In' })
  @Post('signIn')
  login(@Body() dto: UserAuthDto, @Res({ passthrough: true }) res: Response) {
    return this.userProfileService.userSignIn(dto, res);
  }

  @Post('signUp')
  @ApiOperation({ summary: 'User Sign Up' })
  signup(@Body() dto: UserAuthDto): any {
    return this.userProfileService.userSignUp(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User Logout' })
  logout(@Res() res: Response) {
    return this.userProfileService.logout(res);
  }

  // User Action ------------------------------------------------------------------------------------

  @Get('')
  @ApiOperation({ summary: 'Get Current User Profile, App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update Current User Profile, App User Only' })
  updateMe(@Req() req: Request, @Body() dto: UpdateUserProfileDTO) {
    return this.userProfileService.updateMe(req, dto);
  }

  // bookmark Action ------------------------------------------------------------------------------------

  @Get('posts/bookmark')
  @ApiOperation({ summary: 'List all bookmarked post. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeBookmarkList(@Req() req: Request) {
    return this.userProfileService.getAllUserBookmarkList(req.user);
  }
}
