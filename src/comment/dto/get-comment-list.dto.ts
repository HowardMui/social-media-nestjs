import { PostResponse } from 'src/post/dto';
import { QueryParamsWithFilter, TimeStamp } from 'src/types';
import { UserResponse } from 'src/user/dto';

export class GetAllPostCommentParams extends QueryParamsWithFilter {}

export class BaseCommentObject extends TimeStamp {
  commentId: number;
  message: string;
  user: UserResponse;
  userId: number;
  postId: number;
  parentCommentId: number | null;
}

export class CommentWithPostAndParentComment extends BaseCommentObject {
  comments: BaseCommentObject[];
  post: PostResponse;
  parentComment?: BaseCommentObject | null;
}

export class GetCommentInOnePostResponse extends CommentWithPostAndParentComment {}
