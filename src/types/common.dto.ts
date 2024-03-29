import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class PaginationQueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ minimum: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  offset?: number;
}

export class QueryParamsWithFilter extends PaginationQueryParams {
  @ApiPropertyOptional()
  @IsOptional()
  asc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  desc?: string;
}

export class ListResponse<T> {
  count: number;
  rows: T[];
  limit: number;
  offset: number;
}

export class ListResponseWithoutCount<T> {
  rows: T[];
  limit: number;
  offset: number;
}

export class TimeStamp {
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date;
}
