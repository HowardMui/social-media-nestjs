import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOneTagDTO, GetAllTagQueryParams, UpdateOneTagDTO } from './dto';
import { TagService } from './tag.service';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { Roles } from 'src/auth/role-guard/roles.decorator';

@ApiTags('Tags')
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get('')
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all tags. Admin Only' })
  getAllTags(@Query() query: GetAllTagQueryParams) {
    return this.tagService.getAllTagList(query);
  }

  @Get(':tagName')
  // @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Get one tag. Admin Only' })
  getOneTag(@Param('tagName') tagName: string) {
    return this.tagService.getOneTag(tagName);
  }

  @Post('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Create One tag, Admin Only' })
  createOneTag(@Body() body: CreateOneTagDTO) {
    return this.tagService.createOneTag(body);
  }

  @Patch(':tagName')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update One tag, Admin Only' })
  updateOneTag(
    @Param('tagName') tagName: string,
    @Body() body: UpdateOneTagDTO,
  ) {
    return this.tagService.updateOneTag(tagName, body);
  }

  @Delete(':tagName')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete One tag, Admin Only' })
  deleteOneTag(@Param('tagName') tagName: string) {
    return this.tagService.deleteOneTag(tagName);
  }
}
