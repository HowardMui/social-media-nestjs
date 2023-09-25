import { CommentWithPostAndParentComment } from 'src/comment/dto';
import { PaginationQueryParams } from 'src/types';

export class GetMeCommentQueryParams extends PaginationQueryParams {}

export class GetMeCommentResponse extends CommentWithPostAndParentComment {}
