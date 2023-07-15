import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUserQueryParams, UpdateUserDTO } from './dto';
import { Roles } from 'src/auth/role-guard/roles.decorator';
import { Role, RolesGuard } from 'src/auth/role-guard/roles.guard';
import { GetReqReturnType } from 'src/types';
import { User } from '@prisma/client';
import { Request } from 'express';

@ApiTags('user')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // User CRUD ------------------------------------------------------------------------------------------------

  @Get('')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'List all users. Admin Only' })
  getAllUser(
    @Query() query: GetUserQueryParams,
  ): Promise<GetReqReturnType<User>> {
    return this.userService.getUserList(query);
  }

  @Get(':userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get one users.' })
  getOneUser(@Param('userId', new ParseIntPipe()) userId: number) {
    return this.userService.getOneUser(userId);
  }

  @Patch(':userId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Update one user. Admin Only' })
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

  // Follow user action ---------------------------------------------------------------------------------------------------

  @Post(':userId/follow')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'Follow one user. User Only' })
  followOneUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Req() req: Request,
  ) {
    return this.userService.followOneUser(userId, req.user['userId']);
  }

  @Post(':userId/unfollow')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.User)
  @ApiOperation({ summary: 'UnFollow one user. User Only' })
  unFollowOneUser(
    @Param('userId', new ParseIntPipe()) userId: number,
    @Req() req: Request,
  ) {
    return this.userService.unFollowOneUser(userId, req.user['userId']);
  }
}
