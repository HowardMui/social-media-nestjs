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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { SharePostService } from './share-post.service';

@ApiTags('Posts')
@Controller('posts')
export class SharePostController {
  constructor(private sharePostService: SharePostService) {}
  // * Share a post to current User Blog ------------------------------------------------------------------------------------

  @Post(':postId/repost')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({
    summary: 'RePost a post to current User blog. App User only',
  })
  rePostToCurrentUserBlog(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.sharePostService.rePostAPostToCurrentUserBlog(
      postId,
      req.user['userId'],
    );
  }

  // * cancel a post to current User Blog ------------------------------------------------------------------------------------

  @Delete(':postId/repost')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({
    summary: 'Cancel RePost a post. App User only',
  })
  cancelRePostAPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.sharePostService.cancelRePostAPost(postId, req.user['userId']);
  }
}
