import { IsOptional, IsString } from 'class-validator';
import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

export class GetAllTagQueryParamsWithFilter extends PaginationQueryParams {
  @IsString()
  @IsOptional()
  tagName?: string;
}

export class GetAllTagResponse {
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
