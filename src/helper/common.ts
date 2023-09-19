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
