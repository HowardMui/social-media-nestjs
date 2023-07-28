import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive, MaxLength } from 'class-validator';
import { QueryParams } from 'src/types';

export class GetAllPostCommentParams extends QueryParams {}

export class CreateCommentDTO {
  @ApiProperty({ default: null, required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsPositive()
  parentCommentId: number | null;

  @ApiProperty()
  @MaxLength(100)
  message: string;
}
