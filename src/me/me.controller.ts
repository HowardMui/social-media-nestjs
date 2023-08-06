import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MeService } from './me.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  GetOneUserLikedPost,
  GetOneUserPost,
  GetMeBookmarkedPost,
  UpdateUserProfileDTO,
  UserProfileAuthDto,
  UserProfileResponse,
  GetMeBookMarkedPostRes,
} from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';

@ApiTags('me')
@Controller('me')
export class MeController {
  constructor(private userProfileService: MeService) {}

  // * Auth ------------------------------------------------------------------------------------

  @ApiBody({ type: UserProfileAuthDto })
  @ApiForbiddenResponse()
  @ApiOperation({ summary: 'User Sign In' })
  @Post('signIn')
  login(
    @Body() dto: UserProfileAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userProfileService.userSignIn(dto, res);
  }

  @Post('signUp')
  @ApiOperation({ summary: 'User Sign Up' })
  signup(@Body() dto: UserProfileAuthDto): any {
    return this.userProfileService.userSignUp(dto);
  }

  @Post('logout')
  @ApiOperation({ summary: 'User Logout' })
  logout(@Res() res: Response) {
    return this.userProfileService.logout(res);
  }

  // * User Action ------------------------------------------------------------------------------------

  @ApiOkResponse({
    type: UserProfileResponse,
  })
  @Get('')
  @ApiOperation({ summary: 'Get Current User Profile, App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getProfile(@Req() req: Request) {
    return req.user;
    // return this.userProfileService.getCurrentUserProfile(req.user['userId']);
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update Current User Profile, App User Only' })
  updateMe(@Req() req: Request, @Body() dto: UpdateUserProfileDTO) {
    return this.userProfileService.updateMe(req, dto);
  }

  @Get('followers')
  @ApiOperation({ summary: 'Get Current User followers. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeFollowers(@Req() req: Request, @Query() query: any) {
    return this.userProfileService.getUserFollowers(req.user['userId'], query);
  }

  @Get('following')
  @ApiOperation({ summary: 'Get Current User follows. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeFollows(@Req() req: Request, @Query() query: any) {
    return this.userProfileService.getUserFollowing(req.user['userId'], query);
  }

  // * bookmark Action ------------------------------------------------------------------------------------

  @Get('posts/bookmark')
  @ApiOkResponsePaginated(GetMeBookMarkedPostRes)
  @ApiOperation({ summary: 'List all bookmarked post. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeBookmarkList(@Query() query: GetMeBookmarkedPost, @Req() req: Request) {
    return this.userProfileService.getAllMeBookmarkList(
      query,
      req.user['userId'],
    );
  }

  // * like Action ------------------------------------------------------------------------------------
  @Get('posts/like')
  @ApiOperation({ summary: 'List all bookmarked post. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeLikedPost(@Query() query: GetOneUserLikedPost, @Req() req: Request) {
    return this.userProfileService.getMeLikedPostList(
      query,
      req.user['userId'],
    );
  }

  // * Find all current user post ------------------------------------------------------------------------------------
  @Get('posts')
  @ApiOperation({ summary: 'List all post and rePosts. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getAllMePost(@Query() query: GetOneUserPost, @Req() req: Request) {
    return this.userProfileService.getAllMePost(query, req.user['userId']);
  }
}
