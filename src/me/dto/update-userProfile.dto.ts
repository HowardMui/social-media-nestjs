import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Max } from 'class-validator';

export class UpdateUserProfileDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  // @Max(20, { message: 'Maximum 20 chars' })
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  // @Max(20, { message: 'Maximum 20 chars' })
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
  // @Max(200, { message: 'Maximum 200 chars' })
  description?: string;
}
