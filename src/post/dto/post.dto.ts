import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { QueryParams } from 'src/types';

export class GetPostQueryParams extends QueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  @IsOptional()
  userId?: number;
}

export class CreatePostDTO {
  @ApiPropertyOptional()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(200)
  content: string;
}
