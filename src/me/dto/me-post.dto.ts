import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

export class GetMePostQuery extends PaginationQueryParams {}

export class GetMePostResponse extends PostResponse {}
