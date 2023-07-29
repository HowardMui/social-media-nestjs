import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { QueryParams } from 'src/types';

export class GetPostQueryParams extends QueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  @IsOptional()
  userId?: number;
}

export class CreatePostDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  image: string;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @MaxLength(30, {
    each: true,
    message: 'tagName must not be more than 30 characters long',
  })
  tagName?: string[];
}
