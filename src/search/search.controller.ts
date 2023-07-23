import { Controller, Get, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all tags. Admin Only' })
  searchAllTheThings() {
    return this.searchService.searchFn();
  }
}