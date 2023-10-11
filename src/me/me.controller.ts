import {
  Body,
  Controller,
  Get,
  Ip,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { MeService } from './me.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import {
  GetMeBookMarkedPostRes,
  GetMeLikedQueryParams,
  GetMeLikedResponse,
  MeProfileResponse,
  GetMePostResponse,
  GetMePostQueryParams,
  GetMeBookmarkedQueryParams,
  UserSignInDTO,
  UserSignUpDTO,
  GetMeCommentQueryParams,
  GetMeCommentResponse,
} from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import { UpdateMeProfileDTO } from './dto/me-update-profile.dto';

@ApiTags('me')
@Controller('me')
export class MeController {
  constructor(private userProfileService: MeService) {}

  // * Auth ------------------------------------------------------------------------------------

  @Post('signIn')
  @ApiOkResponse({ status: 201, description: 'Login success' })
  @ApiForbiddenResponse()
  @ApiOperation({ summary: 'User Sign In' })
  login(
    @Body() dto: UserSignInDTO,
    @Res({ passthrough: true }) res: Response,
    @Ip() signInIpAddress: string,
    @Req() req: Request,
  ) {
    return this.userProfileService.userSignIn(dto, res, signInIpAddress, req);
  }

  @Post('signUp')
  @ApiOkResponse({ status: 201, description: 'Sign Up success' })
  @ApiOperation({ summary: 'User Sign Up' })
  signup(@Body() dto: UserSignUpDTO): any {
    return this.userProfileService.userSignUp(dto);
  }

  @Post('logout')
  @ApiOkResponse({ status: 201, description: 'Logout success' })
  @ApiOperation({ summary: 'User Logout' })
  logout(@Res() res: Response) {
    return this.userProfileService.logout(res);
  }

  // * User Action ------------------------------------------------------------------------------------

  @Get('')
  @ApiOkResponse({ type: MeProfileResponse })
  @ApiOperation({ summary: 'Get Current User Profile, App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getProfile(@Req() req: Request) {
    return this.userProfileService.getCurrentUserProfile(req.user['userId']);
  }

  @Patch('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update Current User Profile, App User Only' })
  updateMe(@Req() req: Request, @Body() dto: UpdateMeProfileDTO) {
    return this.userProfileService.updateMe(req.user['userId'], dto);
  }

  // * bookmark Action ------------------------------------------------------------------------------------

  @Get('bookmark')
  @ApiOkResponsePaginated(GetMeBookMarkedPostRes)
  @ApiOperation({ summary: 'List all bookmarked post. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeBookmarkList(
    @Query() query: GetMeBookmarkedQueryParams,
    @Req() req: Request,
  ) {
    return this.userProfileService.getAllMeBookmarkList(
      query,
      req.user['userId'],
    );
  }

  // * Find all current user post ------------------------------------------------------------------------------------
  @Get('posts')
  @ApiOkResponsePaginated(GetMePostResponse)
  @ApiOperation({ summary: 'List all post and rePosts. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getAllMePost(@Query() query: GetMePostQueryParams, @Req() req: Request) {
    return this.userProfileService.getAllMePost(query, req.user['userId']);
  }

  @Get('comments')
  @ApiOkResponsePaginated(GetMeCommentResponse)
  @ApiOperation({ summary: 'List all user comments. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getAllMeCommentInPost(
    @Query() query: GetMeCommentQueryParams,
    @Req() req: Request,
  ) {
    return this.userProfileService.getAllMeComment(query, req.user['userId']);
  }

  @Get('posts/following')
  @ApiOkResponsePaginated(GetMePostResponse)
  @ApiOperation({ summary: "List following user's posts. App User Only" })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getAllMeFollowingPost(
    @Query() query: GetMePostQueryParams,
    @Req() req: Request,
  ) {
    return this.userProfileService.getAllMeFollowingPostList(
      query,
      req.user['userId'],
    );
  }
}
