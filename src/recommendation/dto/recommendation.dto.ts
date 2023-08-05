import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { PostResponse } from 'src/post/dto';
import { QueryParams, RecommendationType, RootQueryParams } from 'src/types';

// type UserRole = 'Admin' | 'Moderator' | 'User';

export class GetRecommendationQueryParams extends RootQueryParams {
  //   @ApiProperty({ enum: ['Admin', 'Moderator', 'User'] })
  //   role: UserRole;
  // @ApiProperty({
  //   type: String,
  //   isArray: true,
  //   required: false,
  // })
  // tag: string[];

  @ApiProperty({
    required: false,
    default: RecommendationType.post,
    enum: RecommendationType,
  })
  @IsEnum(RecommendationType)
  type?: RecommendationType;
}

export class RecommendationPostResponse extends PostResponse {
  score: number;
}
