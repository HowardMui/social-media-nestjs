import { GetAllTagResponse } from 'src/tag/dto';
import { PaginationQueryParams } from 'src/types';

export class RecommendationTagFilter extends PaginationQueryParams {}

export class RecommendTagResponse
  implements Omit<GetAllTagResponse, 'createdAt' | 'updatedAt'>
{
  tagId: number;
  tagName: string;
  postCount: number;
}
