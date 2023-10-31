import { PaginationQueryParams } from 'src/types';
import { UserResponse } from 'src/user/dto';

export class RecommendationUserFilter extends PaginationQueryParams {}

export class RecommendationUserResponse extends UserResponse {
  userScore: number;
}
