import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

// type UserRole = 'Admin' | 'Moderator' | 'User';

export enum RecommendationType {
  用戶 = 'user',
  標籤 = 'tag',
  帖文 = 'post',
  // recommended = 'recommended',
}

export class GetRecommendationQueryParamsWithFilter extends PaginationQueryParams {
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
    default: RecommendationType.帖文,
    enum: RecommendationType,
  })
  @IsEnum(RecommendationType)
  type?: RecommendationType;
}

export class RecommendationPostResponse extends PostResponse {
  score: number;
}
