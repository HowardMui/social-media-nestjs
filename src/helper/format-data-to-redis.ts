export const formatDataToRedis = <T>(filter: T, userId?: number): string => {
  let queryString = `-u:${userId}`;
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
