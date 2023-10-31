import { PaginationQueryParams } from 'src/types';
import { UserResponse } from 'src/user/dto';

// * followers

export class GetMeFollowersResponse extends UserResponse {
  isFollowing: boolean;
}

export class GetMeFollowersQueryParams extends PaginationQueryParams {}

// * following

export class GetMeFollowingResponse extends UserResponse {
  isFollowing: boolean;
}

export class GetMeFollowingQueryParams extends PaginationQueryParams {}
