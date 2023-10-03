export const returnAscOrDescInQueryParamsWithFilter = (
  asc: string,
  desc: string,
) => {
  if (!asc && !desc) {
    return undefined;
  }

  const tempObject = {};

  const countKeyMap = {
    likedCount: 'likedByUser',
    commentCount: 'comments',
    bookmarkedCount: 'bookmarkedByUser',
    rePostedCount: 'rePostedByUser',
    followersCount: 'followers',
    followingCount: 'following',
  };

  if (asc) {
    if (countKeyMap.hasOwnProperty(asc)) {
      tempObject[countKeyMap[asc]] = { _count: 'asc' };
    } else {
      tempObject[asc] = 'asc';
    }
  }

  if (desc) {
    if (countKeyMap.hasOwnProperty(desc)) {
      tempObject[countKeyMap[desc]] = { _count: 'desc' };
    } else {
      tempObject[desc] = 'desc';
    }
  }

  return tempObject;
};

interface FormatListResponseType<T> {
  rows: T;
  count?: number;
  limit?: number;
  offset?: number;
}

export const formatListResponseObject = <T>(
  params: FormatListResponseType<T>,
) => {
  return {
    count: params.count,
    rows: params.rows,
    limit: params.limit ?? 20,
    offset: params.offset ?? 0,
  };
};
