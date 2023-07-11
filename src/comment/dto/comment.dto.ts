import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { MaxLength } from 'class-validator';
import { QueryParams } from 'src/types';

export class GetAllPostCommentParams extends QueryParams {}

export class CreateCommentDTO {
  @ApiProperty()
  @Transform(({ value }) => parseInt(value))
  postId: number;

  @ApiProperty()
  @MaxLength(100)
  comment: string;
}
