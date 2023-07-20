import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOneTagDTO, GetAllTagQueryParams } from './dto';
import { TagService } from './tag.service';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';

@ApiTags('Tags')
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all tags. Admin Only' })
  getAllTags(@Query() query: GetAllTagQueryParams) {
    return this.tagService.getAllTagList(query);
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create One tag, Admin Only' })
  createOneTag(@Body() body: CreateOneTagDTO) {
    return this.tagService.createOneTag(body);
  }
}
