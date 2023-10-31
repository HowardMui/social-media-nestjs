import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

export enum GetMePostEnum {
  所有帖文 = 'post',
  //   回覆 = 'reply',
  讚好 = 'like',
  書籤 = 'bookmark',
}
export class GetMePostQueryParams extends PaginationQueryParams {
  //   @ApiProperty({
  //     required: false,
  //     default: GetMePostEnum.所有帖文,
  //     enum: GetMePostEnum,
  //   })
  //   @IsEnum(GetMePostEnum)
  //   postType: GetMePostEnum;
}

export class GetMePostResponse extends PostResponse {}
