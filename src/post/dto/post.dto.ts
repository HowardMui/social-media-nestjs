import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { QueryParams } from 'src/types';

export class GetPostQueryParams extends QueryParams {}

export class CreatePostDTO {
  @ApiPropertyOptional()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(200)
  content: string;
}
