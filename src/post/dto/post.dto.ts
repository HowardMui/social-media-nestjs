import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { QueryParamsWithFilter, TimeStamp } from 'src/types';
import { UserResponse, UserResponseExampleDTO } from 'src/user/dto';

export class GetPostQueryParamsWithFilter extends QueryParamsWithFilter {
  @ApiProperty()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsOptional()
  tagName?: string;
}

export class PostResponse extends TimeStamp {
  postId: number;
  image?: string;
  content: string;
  userId: number;
  user: UserResponse;
  tags: string[];
  likedCount: number;
  commentCount: number;
  bookmarkedCount: number;
  rePostedCount: number;
}

export const PostResponseExampleDTO = {
  postId: 0,
  image: 'www.example.com',
  content: 'string',
  userId: 0,
  user: { ...UserResponseExampleDTO },
  tags: ['test tag'],
  likedCount: 0,
  commentCount: 0,
  bookmarkedCount: 0,
  rePostedCount: 0,
  createdAt: 'string',
  updatedAt: 'string',
  deletedAt: 'string',
};
