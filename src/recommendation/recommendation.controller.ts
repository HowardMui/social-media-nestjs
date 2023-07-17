import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import {
  GetRecommendationQueryParams,
  GetRecommendationUserQueryParams,
} from './dto';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  @Get('posts')
  @ApiOperation({ summary: 'Get recommendation list.' })
  @UseGuards(AuthGuard('jwt'))
  getRecommendationPostList(
    @Query() query: GetRecommendationQueryParams,
    @Req() req: Request,
  ) {
    // return req.user;
    // return this.userProfileService.getCurrentUserProfile(req.user['userId']);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get recommendation user.' })
  @UseGuards(AuthGuard('jwt'))
  getRecommendationUserList(
    @Query() query: GetRecommendationUserQueryParams,
    @Req() req: Request,
  ) {
    // return req.user;
    // return this.userProfileService.getCurrentUserProfile(req.user['userId']);
  }
}
