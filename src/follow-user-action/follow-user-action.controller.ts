import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { FollowUserActionService } from './follow-user-action.service';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import {
  GetMeFollowersQueryParams,
  GetMeFollowersResponse,
  GetMeFollowingQueryParams,
  GetMeFollowingResponse,
} from './dto';

@ApiTags('user')
@Controller('users')
export class FollowUserActionController {
  constructor(private followUserService: FollowUserActionService) {}
  @Post(':userId/follow')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Follow one user. User Only' })
  @ApiResponse({
    status: 201,
    description: 'Followed user',
  })
  followOneUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Req() req: Request,
  ) {
    return this.followUserService.followOneUser(userId, req.user['userId']);
  }

  @Delete(':userId/unfollow')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'UnFollow one user. User Only' })
  @ApiResponse({
    status: 201,
    description: 'UnFollowed user',
  })
  unFollowOneUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Req() req: Request,
  ) {
    return this.followUserService.unFollowOneUser(userId, req.user['userId']);
  }
}

@ApiTags('me')
@Controller('me')
export class MeFollowController {
  constructor(private followUserService: FollowUserActionService) {}

  @Get('followers')
  @ApiOkResponsePaginated(GetMeFollowersResponse)
  @ApiOperation({ summary: 'Get Current User followers. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeFollowers(
    @Req() req: Request,
    @Query() query: GetMeFollowersQueryParams,
  ) {
    // return 'hello world';
    return this.followUserService.getUserFollowers(req.user['userId'], query);
  }

  @Get('following')
  @ApiOkResponsePaginated(GetMeFollowingResponse)
  @ApiOperation({ summary: 'Get Current User following. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeFollows(@Req() req: Request, @Query() query: GetMeFollowingQueryParams) {
    // return this.userProfileService.getUserFollowing(req.user['userId'], query);
  }
}
