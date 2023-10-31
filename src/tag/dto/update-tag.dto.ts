import { ApiProperty } from '@nestjs/swagger';
import { IsArray, MaxLength } from 'class-validator';

export class UpdateOneTagDTO {
  @ApiProperty()
  @MaxLength(30)
  tagName: string;

  // @ApiProperty({ type: [Number] })
  // @IsArray()
  // postId: number[];
}
