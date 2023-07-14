import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min, min } from 'class-validator';

export class QueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ default: 20, minimum: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ default: 0, required: false })
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
