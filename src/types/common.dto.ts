import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  limit?: number;

  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional()
  @IsOptional()
  asc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  desc?: string;
}

export interface GetReqReturnType<T> {
  count: number;
  rows: T[];
  limit: number;
  offset: number;
}
