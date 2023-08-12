import { PaginationQueryParams } from 'src/types';
import { UserProfileResponse } from './user-profile.dto';

// * followers

export class GetMeFollowersResponse extends UserProfileResponse {
  isFollowing: boolean;
}

export class GetMeFollowersQueryParam extends PaginationQueryParams {}

// * following

export class GetMeFollowingResponse extends UserProfileResponse {}

export class GetMeFollowingQueryParam extends PaginationQueryParams {}
