import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

export enum GetUserPostEnum {
  Posts = 'post',
  Replies = 'reply',
  Likes = 'like',
}

export class GetUserPostQuery extends PaginationQueryParams {
  @ApiProperty({
    required: false,
    default: GetUserPostEnum.Posts,
    enum: GetUserPostEnum,
  })
  @IsEnum(GetUserPostEnum)
  postType: GetUserPostEnum;
}

export class GetOneUserPostResponse extends PostResponse {}
