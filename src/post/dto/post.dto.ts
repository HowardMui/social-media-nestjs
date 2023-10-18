import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

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

export class CreatePostDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  image: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @MaxLength(30, {
    each: true,
    message: 'tagName must not be more than 30 characters long',
  })
  tagName?: string[];
}
