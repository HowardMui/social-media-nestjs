import { RootQueryParams } from 'src/types';
import { UserProfileResponse } from './user-profile.dto';

// * followers

export class GetMeFollowersResponse extends UserProfileResponse {
  isFollowing: boolean;
}

export class GetMeFollowersQueryParam extends RootQueryParams {}

// * following

export class GetMeFollowingResponse extends UserProfileResponse {}

export class GetMeFollowingQueryParam extends RootQueryParams {}
