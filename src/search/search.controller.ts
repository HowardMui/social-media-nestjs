import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { GetSearchQueryParams } from './dto/search.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Search posts and users' })
  searchAllTheThings(@Query() query: GetSearchQueryParams) {
    return this.searchService.searchFn(query);
  }
}
