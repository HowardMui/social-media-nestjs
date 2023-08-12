import { PostResponse } from 'src/post/dto';
import { PaginationQueryParams } from 'src/types';

export class GetMeBookmarkedPost extends PaginationQueryParams {}

export class GetMeBookMarkedPostRes extends PostResponse {}
