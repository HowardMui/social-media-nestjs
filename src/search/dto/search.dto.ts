import { ApiProperty } from '@nestjs/swagger';
import { QueryParams, RootQueryParams } from 'src/types';

export class GetSearchQueryParams extends RootQueryParams {
  @ApiProperty({ required: false })
  keyword?: string;

  @ApiProperty({ required: false })
  type?: 'user' | 'post' | 'tag' | 'all';
}
