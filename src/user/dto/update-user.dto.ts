import { IsOptional, IsString, Max } from 'class-validator';

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  @Max(20, { message: 'Maximum 20 chars' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @Max(20, { message: 'Maximum 20 chars' })
  lastName?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @Max(200, { message: 'Maximum 200 chars' })
  description?: string;
}
