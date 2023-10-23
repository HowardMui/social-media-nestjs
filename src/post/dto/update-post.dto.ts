import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty({ type: [String], nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @MaxLength(30, {
    each: true,
    message: 'tagName must not be more than 30 characters',
  })
  tagName: string[];
}
