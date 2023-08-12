import { QueryParamsWithFilter, TimeStamp } from 'src/types';
import { IsOptional, IsString, Max } from 'class-validator';

export class GetUserQueryParamsWithFilter extends QueryParamsWithFilter {}

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  @Max(20, { message: 'Maximum 20 chars' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Max(20, { message: 'Maximum 20 chars' })
  LastName?: string;

  @IsOptional()
  @IsString()
  image?;

  @IsOptional()
  @IsString()
  bio?;

  @IsOptional()
  @IsString()
  @Max(200, { message: 'Maximum 200 chars' })
  description?;
}

export class UserProfileResponse extends TimeStamp {
  userId: number;
  firstName: string;
  LastName: string;
  email: string;
  userName: string;
  image: string;
  bio: string;
  description: string;
  isVerified: boolean;
}
