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
import { BookmarkService } from './bookmark.service';
import { AuthGuard } from '@nestjs/passport';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Request } from 'express';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import { GetMeBookMarkedPostRes, GetMeBookmarkedQueryParams } from 'src/me/dto';

@ApiTags('Posts')
@Controller('posts')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Post(':postId/bookmark')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Bookmark post by postId, App User Only' })
  bookmarkOnePost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.bookmarkService.bookmarkOnePost(postId, req.user['userId']);
  }

  @Delete(':postId/bookmark')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'UnBookmark post by postId, App User Only' })
  unBookmarkOnePost(
    @Param('postId', new ParseIntPipe()) postId: number,
    @Req() req: Request,
  ) {
    return this.bookmarkService.deleteOneBookmark(postId, req.user['userId']);
  }
}

@ApiTags('me')
@Controller('me')
export class MeBookmarkedPostController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get('bookmark')
  @ApiOkResponsePaginated(GetMeBookMarkedPostRes)
  @ApiOperation({ summary: 'List all bookmarked post. App User Only' })
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  getMeBookmarkList(
    @Query() query: GetMeBookmarkedQueryParams,
    @Req() req: Request,
  ) {
    return this.bookmarkService.getAllMeBookmarkList(query, req.user['userId']);
  }
}
