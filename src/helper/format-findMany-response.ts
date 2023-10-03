import { Tag } from 'src/tag/dto';

export const formatResponseListData = <T extends Record<string, any>>(
  obj: T,
) => {
  const counts = obj['_count'];
  const formattedObj = { ...obj };

  const countMappings: Record<string, string> = {
    bookmarkedByUser: 'bookmarkedCount',
    comments: 'commentCount',
    likedByUser: 'likedCount',
    rePostOrderByUser: 'rePostedCount',
  };

  for (const key in counts) {
    const formattedKey = countMappings[key];
    if (formattedKey) {
      formattedObj[formattedKey as keyof T] = counts[key];
    }
  }

  delete formattedObj['_count'];
  if (formattedObj['tags']) {
    const newTagMapping = formattedObj['tags'].map((t: Tag) => t.tagName);
    return { ...formattedObj, tags: newTagMapping } as Omit<T, '_count'> & {
      [P in keyof typeof countMappings]: number;
    };
  }
  return formattedObj as Omit<T, '_count'> & {
    [P in keyof typeof countMappings]: number;
  };
};
