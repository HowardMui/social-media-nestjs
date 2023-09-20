export const formatDataToRedis = <T>(filter: T): string => {
  let queryString = '';
  if (!filter['limit']) {
    queryString += `-20`;
  }
  if (!filter['offset']) {
    queryString += `-0`;
  }
  for (const [key, value] of Object.entries(filter)) {
    switch (key) {
      case 'limit':
        queryString += `-${value}`;
        break;
      case 'offset':
        queryString += `-${value}`;
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
    }
  }
  return queryString;
};
