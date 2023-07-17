import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { QueryParams } from 'src/types';

type UserRole = 'Admin' | 'Moderator' | 'User';

export class GetRecommendationQueryParams extends QueryParams {
  @ApiProperty({ required: false })
  titie?: string;

  //   @ApiProperty({ enum: ['Admin', 'Moderator', 'User'] })
  //   role: UserRole;
  @ApiProperty({
    type: String,
    isArray: true,
    required: false,
  })
  tag: string[];
}

export class GetRecommendationUserQueryParams extends QueryParams {
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ required: false })
  userId?: number;
}
