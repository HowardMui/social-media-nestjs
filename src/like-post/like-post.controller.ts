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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LikePostService } from './like-post.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Request } from 'express';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import { GetMeLikedQueryParams, GetMeLikedResponse } from 'src/me/dto';

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

@ApiTags('me')
@Controller('me')
export class MeLikedPostController {
  constructor(private likeService: LikePostService) {}

  @Get('like')
  @ApiOkResponsePaginated(GetMeLikedResponse)
  @ApiOperation({ summary: 'List all bookmarked post. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeLikedPost(@Query() query: GetMeLikedQueryParams, @Req() req: Request) {
    return this.likeService.getMeLikedPostList(query, req.user['userId']);
  }
}
