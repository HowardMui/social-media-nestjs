import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePostDTO {
  @ApiPropertyOptional()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(200)
  content: string;
}
