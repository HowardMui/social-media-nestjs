import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

export class CreateCommentDTO {
  @ApiProperty()
  @MaxLength(100)
  message: string;

  @ApiPropertyOptional()
  images: string;
}
