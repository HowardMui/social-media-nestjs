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
  LastName: string;
  email: string;
  userName: string;
  image: string;
  bio: string;
  description: string;
  isVerified: boolean;
}

export class GetUserListResponse extends UserResponse {
  followersCount: number;
  followingCount: number;
}

export class GetOneUserResponse extends UserResponse {
  followersCount: number;
  followingCount: number;
}
