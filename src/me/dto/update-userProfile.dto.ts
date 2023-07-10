import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Max, MaxLength } from 'class-validator';

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
