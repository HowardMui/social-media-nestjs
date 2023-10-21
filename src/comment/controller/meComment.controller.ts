import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MeCommentService } from '../services/meComment.service';
import { GetMeCommentQueryParams, GetMeCommentResponse } from '../dto';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import { AuthGuard } from '@nestjs/passport';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Request } from 'express';

@ApiTags('me')
@Controller('me')
export class MeCommentController {
  constructor(private meCommentService: MeCommentService) {}

  @Get('comments')
  @ApiOkResponsePaginated(GetMeCommentResponse)
  @ApiOperation({ summary: 'List all user comments. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getAllMeCommentInPost(
    @Query() query: GetMeCommentQueryParams,
    @Req() req: Request,
  ) {
    return this.meCommentService.getAllMeComment(query, req.user['userId']);
  }
}
