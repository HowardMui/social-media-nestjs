import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMeProfileDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MaxLength(20)
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  lastName?: string;

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
