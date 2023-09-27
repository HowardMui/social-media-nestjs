import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { FollowUserActionService } from './follow-user-action.service';

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
