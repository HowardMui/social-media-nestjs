import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import {
  GetRecommendationQueryParams,
  RecommendationPostResponse,
} from './dto';
import { RecommendationService } from './recommendation.service';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @ApiOkResponse({
    description: 'The post records',
    type: RecommendationPostResponse,
  })
  @Get('')
  @ApiOperation({ summary: 'Get recommendation list. App user only.' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getRecommendationList(
    @Query() query: GetRecommendationQueryParams,
    @Req() req: Request,
  ) {
    return this.recommendationService.getRecommendationList(query);
  }
}
