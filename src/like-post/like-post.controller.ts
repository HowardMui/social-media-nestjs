import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LikePostService } from './like-post.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Request } from 'express';

@ApiTags('Posts')
@Controller('posts')
export class LikePostController {
  constructor(private likeService: LikePostService) {}

  @Post(':postId/like')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Like a post. App User only' })
  likeAPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.likeService.likeAPostByUser(postId, req.user['userId']);
  }

  @Delete(':postId/like')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'UnLike a post. App User only' })
  unLikeAPost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.likeService.unLikeAPost(postId, req.user['userId']);
  }
}
