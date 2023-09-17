import { QueryParamsWithFilter, TimeStamp } from 'src/types';
import { UserResponse } from 'src/user/dto';

export class GetAllPostCommentParams extends QueryParamsWithFilter {}

export class BaseCommentObject extends TimeStamp {
  commentId: number;
  //   comments: BaseCommentObject[];
  message: string;
  user: UserResponse;
  userId: number;
  postId: number;
  parentCommentId: number | null;
}

export class GetCommentInOnePostResponse extends BaseCommentObject {
  comments: BaseCommentObject[];
}
