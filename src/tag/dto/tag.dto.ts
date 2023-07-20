import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { QueryParams } from 'src/types';

export class GetAllTagQueryParams extends QueryParams {}

export class CreateOneTagDTO {
  @ApiProperty()
  @MaxLength(30)
  tagName: string;

  @ApiProperty({
    type: Number,
    isArray: true,
    required: false,
  })
  postId: number[];
}
