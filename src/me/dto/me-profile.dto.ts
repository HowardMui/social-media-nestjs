import { UserResponse } from 'src/user/dto';

export class MeProfileResponse extends UserResponse {
  followersCount: number;
  followingCount: number;
}
