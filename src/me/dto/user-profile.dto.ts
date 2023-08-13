import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserResponse } from 'src/user/dto';

export class UserProfileAuthDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(20)
  userName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UpdateUserProfileDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  LastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class MeProfileResponse extends UserResponse {
  followersCount: number;
  followingCount: number;
}
