import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { PostQueryParams } from './dto';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'List All Post' })
  getAllPosts(@Query() query: PostQueryParams) {
    return this.postService.getAllPostLists(query);
  }
}
