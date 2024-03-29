import { IsOptional, IsString } from 'class-validator';
import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams, TimeStamp } from 'src/types';

export class GetAllTagQueryParamsWithFilter extends PaginationQueryParams {
  @IsString()
  @IsOptional()
  tagName?: string;
}

export class Tag {
  tagId: number;
  tagName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export class GetAllTagResponse implements Omit<TimeStamp, 'deletedAt'> {
  tagId: number;
  tagName: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export class GetPostListWithTagQuery extends PaginationQueryParams {}

export class GetPostListWithTagResponse extends GetAllTagResponse {
  posts: PostResponse[];
}
