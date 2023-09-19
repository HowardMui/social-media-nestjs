import { ApiProperty } from '@nestjs/swagger';
import { IsArray, MaxLength } from 'class-validator';

export class CreateOneTagDTO {
  @ApiProperty()
  @MaxLength(30)
  tagName: string;

  @ApiProperty({ type: [Number] })
  // @Type(() => Number)
  @IsArray()
  // @IsInt({ each: true })
  // @ArrayMaxSize(1000)
  // @ArrayUnique()
  // @Transform(({ value }) => value.map(Number))
  // @Body({ each: true, transform: (value) => parseInt(value) })
  postId: number[];
}
