interface FormatDataToRedisType<T> {
  filter: T;
  userId?: number;
  keyword: string;
}

export const formatDataToRedis = <T>(
  params: FormatDataToRedisType<T>,
): string => {
  const { filter, keyword, userId } = params;
  let queryString = `u:${userId}-${keyword}`;
  if (!filter['limit']) {
    queryString += `-l:20`;
  }
  if (!filter['offset']) {
    queryString += `-o:0`;
  }
  for (const [key, value] of Object.entries(filter)) {
    switch (key) {
      case 'limit':
        queryString += `-l:${value}`;
        break;
      case 'offset':
        queryString += `-o:${value}`;
        break;
      case 'asc':
        queryString += `-a:${value}`;
        break;
      case 'desc':
        queryString += `-d:${value}`;
        break;
      case 'userName':
        queryString += `-u:${value}`;
        break;
      case 'type':
        queryString += `-t:${value}`;
    }
  }
  return queryString;
};
