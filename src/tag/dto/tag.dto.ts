import { Body } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  MaxLength,
} from 'class-validator';
import { QueryParamsWithFilter } from 'src/types';

export class GetAllTagQueryParamsWithFilter extends QueryParamsWithFilter {}

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

export class UpdateOneTagDTO {
  @ApiProperty()
  @MaxLength(30)
  tagName: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  postId: number[];
}
