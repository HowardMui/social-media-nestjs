import { rawQueryParams } from 'src/types';
import {
  selectPostRawQuery,
  selectTagRawQuery,
  selectUserRawQuery,
} from './common';

export const userPostAndRePostCount = (userId: number) => {
  return ` 
        select count(*) as count from (
            select
            ${selectPostRawQuery}, p.createdAt from post as p
            where p.userId = ${userId}
            GROUP BY p.postId
          union
            select
            ${selectPostRawQuery}, rp.createdAt from post as p
            inner join user_rePost as rp on rp.postId = p.postId
            where rp.userId = ${userId}
            GROUP BY p.postId
          )
        a
        `;
};

export const userPostAndRePost = ({
  userId,
  limit,
  offset,
}: rawQueryParams) => {
  return ` select * from (
          select
              ${selectUserRawQuery}, ${selectPostRawQuery}, ${selectTagRawQuery},
              count(lp.postId) as 'likedCount', count(bp.postId) as 'bookmarkedCount', 
              count(rp.postId) as 'rePostedCount', count(cm.postId) as 'commentCount',
              null as rePostUser,
              p.createdAt from post as p
            inner join user AS u ON p.userId = u.userId
            left join user_rePost as rp on rp.postId = p.postId
            left join user_likePost as lp on lp.postId = p.postId
            left join user_bookmarkPost as bp on bp.postId = p.postId
            left join comment as cm on cm.postId = p.postId and cm.parentCommentId is null
            where p.userId = ${userId}
            GROUP BY p.postId
          union
            select
            ${selectUserRawQuery}, ${selectPostRawQuery}, ${selectTagRawQuery},
              count(bp.postId) as 'bookmarkedCount', count(lp.postId) as 'likedCount', 
              count(rp.postId) as 'rePostedCount', count(cm.postId) as 'commentCount',
              JSON_OBJECT('userId', rp_u.userId, 'userName', rp_u.userName) as rePostUser,
              rp.createdAt from post as p
            inner join user AS u ON p.userId = u.userId
            inner join user_rePost as rp on rp.postId = p.postId
            left join user as rp_u on rp_u.userId = rp.userId
            left join user_likePost as lp on lp.postId = p.postId
            left join user_bookmarkPost as bp on bp.postId = p.postId
            left join comment as cm on cm.postId = p.postId and cm.parentCommentId is null
            where rp.userId = ${userId}
            GROUP BY p.postId
          )
      a 
      order by createdAt desc
      limit ${limit ?? 20}
      offset ${offset ?? 0}
      `;
};
