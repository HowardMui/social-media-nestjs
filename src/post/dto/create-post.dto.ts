import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePostDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  content: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  images: string[];

  @ApiProperty({ type: [String], required: true, nullable: false })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(30, {
    each: true,
    message: 'tagName must not be more than 30 characters',
  })
  tagName: string[];
}
