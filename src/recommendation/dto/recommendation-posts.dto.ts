import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

export class RecommendationPostFilter extends PaginationQueryParams {}

export class RecommendationPostResponse extends PostResponse {
  postScore: number;
}
