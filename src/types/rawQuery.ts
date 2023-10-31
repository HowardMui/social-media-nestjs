export interface rawQueryParams {
  userId: number;
  limit: number;
  offset: number;
}

export interface rawQueryTagNameParams extends Omit<rawQueryParams, 'userId'> {
  tagName: string;
}
