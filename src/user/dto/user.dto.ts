import { QueryParams } from 'src/types';
import { IsOptional, IsString, Max } from 'class-validator';

export class GetUserQueryParams extends QueryParams {}

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
