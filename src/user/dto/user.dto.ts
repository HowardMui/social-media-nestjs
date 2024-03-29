import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { QueryParamsWithFilter, TimeStamp } from 'src/types';

export class GetUserListQueryParams extends QueryParamsWithFilter {
  @ApiProperty()
  @IsOptional()
  userName?: string;
}

export class UserResponse extends TimeStamp {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  avatar: string;
  bio: string;
  description: string;
  isVerified: boolean;
}

export const UserResponseExampleDTO: UserResponse = {
  userId: 0,
  firstName: 'Howard',
  lastName: 'Mui',
  email: 'example@gmail.com',
  userName: 'HowardMui',
  avatar: 'example.jpg',
  bio: 'string',
  description: 'string',
  isVerified: false,
  createdAt: 'string',
  updatedAt: 'string',
  deletedAt: 'string',
};

export class GetUserListResponse extends UserResponse {
  followersCount: number;
  followingCount: number;
}

export class GetOneUserResponse extends UserResponse {
  followersCount: number;
  followingCount: number;
}
