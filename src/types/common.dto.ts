import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class QueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiProperty()
  @IsNotEmpty()
  limit: number;

  @Transform(({ value }) => parseInt(value))
  @ApiProperty()
  @IsNotEmpty()
  offset: number;

  @ApiPropertyOptional()
  @IsOptional()
  asc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  desc?: string;

  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  @IsOptional()
  userId?: number;
}

export interface GetReqReturnType<T> {
  count: number;
  rows: T[];
  limit: number;
  offset: number;
}
