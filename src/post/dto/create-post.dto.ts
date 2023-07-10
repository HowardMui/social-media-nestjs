import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreatePostDTO {
  @ApiPropertyOptional()
  image: string;

  @ApiProperty()
  @IsNotEmpty()
  content: string;
}
