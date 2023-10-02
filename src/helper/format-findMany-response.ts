import { Tag } from 'src/tag/dto';
import { UserResponse } from 'src/user/dto';

// export class TestPostResponse {
//   postId: number;
//   image?: string;
//   content: string;
//   userId: number;
//   user: UserResponse;
//   tags: Tag[];
//   _count: {
//     bookmarkedByUser: number;
//     comments: number;
//     likedByUser: number;
//     rePostOrderByUser: number;
//   };
// }

// export const formatCount = (post: TestPostResponse) => {
//   const { _count, tags, ...rest } = post;
//   return {
//     ...rest,
//     tags: tags.map((t) => t.tagName),
//     likedCount: _count.likedByUser,
//     commentCount: _count.comments,
//     bookmarkedCount: _count.bookmarkedByUser,
//     rePostedCount: _count.rePostOrderByUser,
//   };
// };

export const formatCount = <T extends Record<string, any>>(obj: T) => {
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
  return formattedObj as Omit<T, '_count'> & {
    [P in keyof typeof countMappings]: number;
  };
};
