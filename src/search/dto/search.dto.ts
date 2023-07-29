import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { RootQueryParams } from 'src/types';

export enum SearchType {
  user = 'user',
  post = 'post',
  tag = 'tag',
  popular = 'popular',
  latest = 'latest',
}

export class GetSearchQueryParams extends RootQueryParams {
  @ApiProperty({ required: false })
  @Transform(({ value }) => value.toString())
  @IsString()
  keyword?: string;

  @ApiProperty({ required: false, default: SearchType.post, enum: SearchType })
  @IsEnum(SearchType)
  type?: SearchType;

  // @ApiProperty({ default: false, required: false })
  // @IsBoolean()
  // isSearchPopup?: boolean;
}
