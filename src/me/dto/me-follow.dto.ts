import { PaginationQueryParams } from 'src/types';
import { UserProfileResponse } from 'src/user/dto';

// * followers

export class GetMeFollowersResponse extends UserProfileResponse {
  isFollowing: boolean;
}

export class GetMeFollowersQueryParams extends PaginationQueryParams {}

// * following

export class GetMeFollowingResponse extends UserProfileResponse {
  isFollowing: boolean;
}

export class GetMeFollowingQueryParams extends PaginationQueryParams {}
