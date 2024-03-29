import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import {
  GetOneUserResponse,
  GetUserListQueryParams,
  GetUserListResponse,
} from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { UpdateUserDTO } from './dto/update-user.dto';
import { ApiOkResponsePaginated } from 'src/types/decorator/generic.decorator';
import { GetOneUserPostResponse, GetUserPostQuery } from './dto/user-post.dto';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // User CRUD ------------------------------------------------------------------------------------------------

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all users. Admin Only' })
  @ApiOkResponsePaginated(GetUserListResponse)
  getAllUser(@Query() query: GetUserListQueryParams) {
    return this.userService.getUserList(query);
  }

  @Get(':userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get one user.' })
  @ApiOkResponse({ type: GetOneUserResponse })
  getOneUser(@Param('userId', new ParseIntPipe()) userId: number) {
    return this.userService.getOneUser(userId);
  }

  @Get(':userId/post')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get one user post post details.' })
  // * for multiple type with different enum
  // @ApiOkResponse({ type: GetOneUserResponse })
  // @ApiExtraModels(GetOneUserPostResponse, GetOneUserLikedPostResponse)
  // @ApiOkResponse({
  //   schema: {
  //     anyOf: refs(GetOneUserPostResponse, GetOneUserLikedPostResponse),
  //   },
  // })
  @ApiOkResponsePaginated(GetOneUserPostResponse)
  getOneUserPostDetail(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Query() query: GetUserPostQuery,
  ) {
    return this.userService.getOneUserPostDetail(userId, query);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update one user. Admin Only' })
  @ApiOkResponse({ type: GetOneUserResponse })
  updateOneUser(@Param('userId') userId: number, @Body() dto: UpdateUserDTO) {
    return this.updateOneUser(userId, dto);
  }

  @Delete(':userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete one user. Admin Only' })
  deleteOneUser(@Param('userId') userId: number) {
    return this.userService.deleteOneUser(userId);
  }
}
