import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, refs } from '@nestjs/swagger';
import { GetSearchQueryParamsWithFilter } from './dto/search.dto';
import { PostResponse, PostResponseExampleDTO } from 'src/post/dto';
import { GetAllTagResponse } from 'src/tag/dto';
import { GetUserListResponse, UserResponseExampleDTO } from 'src/user/dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('')
  @ApiResponse({
    status: 200,
    description: 'Successful response',
    content: {
      'application/json': {
        schema: {
          anyOf: refs(PostResponse, GetAllTagResponse, GetUserListResponse),
        },
        examples: {
          post: { value: { ...PostResponseExampleDTO } },
          users: { value: { ...UserResponseExampleDTO } },
          tags: { value: { ...PostResponseExampleDTO } },
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Search posts, users and tags' })
  searchAllTheThings(@Query() query: GetSearchQueryParamsWithFilter) {
    return this.searchService.searchFn(query);
  }
}
