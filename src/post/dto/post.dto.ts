import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { QueryParamsWithFilter, TimeStamp } from 'src/types';
import { UserProfileResponse } from 'src/user/dto';

export class GetPostQueryParamsWithFilter extends QueryParamsWithFilter {
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  @IsOptional()
  userId?: number;
}

export class PostResponse extends TimeStamp {
  // @ApiProperty()
  postId: number;

  // @ApiProperty()
  // @IsString()
  image?: string;

  // @ApiProperty()
  // @IsString()
  content: string;

  // @ApiProperty()
  // impression: number;

  // @ApiProperty()
  userId: number;
  user: UserProfileResponse;
  // user;
  // @ApiProperty()
  // numOfUserRePost: number;
  // listUserRePost;
  // @ApiProperty()
  // numOfUserLikes: number;

  // likedByUser;
  // tags;
  // comments;
  // bookmarkedByUser;
  // @ApiProperty()

  tags: string[];
  likedCount: number;
  commentCount: number;
  bookmarkedCount: number;
  rePostedCount: number;
}

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
