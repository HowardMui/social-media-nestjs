import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';
import { PaginationQueryParams, SearchType } from 'src/types';

export class GetSearchQueryParamsWithFilter extends PaginationQueryParams {
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.toString())
  @IsString()
  keyword: string;

  @ApiProperty({
    required: false,
    default: SearchType.用戶,
    enum: SearchType,
  })
  @IsEnum(SearchType)
  type?: SearchType;

  // @ApiProperty({ default: false, required: false })
  // @IsBoolean()
  // isSearchPopup?: boolean;
}
