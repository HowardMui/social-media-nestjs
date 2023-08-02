import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { QueryParams, RecommendationType } from 'src/types';

// type UserRole = 'Admin' | 'Moderator' | 'User';

export class GetRecommendationQueryParams extends QueryParams {
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
