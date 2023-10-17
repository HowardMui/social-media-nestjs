import { rawQueryParams } from 'src/types';
import {
  selectPostRawQuery,
  selectTagRawQuery,
  selectUserRawQuery,
} from './common.rawQuery';

export const findMeFollowingPostAndRePostCount = (userId: number) => {
  return `
  select count(*) as count from (
    select ${selectPostRawQuery}, p.createdAt
    from posts as p 
    where p.userId in (
        select uf.followingId from userFollows as uf
        where uf.followerId = ${userId}
    )
    group by p.postId
    union
    select ${selectPostRawQuery}, rp.createdAt
    from posts as p 
    inner join user_rePost as rp on rp.postId = p.postId
    where rp.userId in (
        select uf.followingId from userFollows as uf
        where uf.followerId = ${userId}
    )
    group by p.postId, rp.createdAt
  )
  as a
  `;
};

export const findMeFollowingPostAndRePost = ({
  userId,
  limit,
  offset,
}: rawQueryParams): string => {
  return `
  select * from (
    select ${selectPostRawQuery} ,${selectUserRawQuery}, ${selectTagRawQuery},
    count(lp.postId) as 'likedCount', count(bp.postId) as 'bookmarkedCount', count(rp.postId) as 'rePostedCount',
    null as rePostUser, p.createdAt
    from posts as p 
    inner join users AS u ON p.userId = u.userId

    left join user_rePost as rp on rp.postId = p.postId
    left join user_likePost as lp on lp.postId = p.postId
    left join user_bookmarkPost as bp on bp.postId = p.postId

    where p.userId in (
        select uf.followingId from userFollows as uf
        where uf.followerId = ${userId}
    )
    group by p.postId
    union
    select ${selectPostRawQuery}, ${selectUserRawQuery}, ${selectTagRawQuery},
    count(lp.postId) as 'likedCount', count(bp.postId) as 'bookmarkedCount', count(rp.postId) as 'rePostedCount',
    MIN(JSON_OBJECT('userId', rp_u.userId, 'userName', rp_u.userName)) as rePostUser, MIN(rp.createdAt) as createdAt
    from posts as p 
    inner join users AS u ON p.userId = u.userId

    inner join user_rePost as rp on rp.postId = p.postId
    left join users AS rp_u ON rp.userId = rp_u.userId
    
    left join user_likePost as lp on lp.postId = p.postId
    left join user_bookmarkPost as bp on bp.postId = p.postId
    where rp.userId in (
        select uf.followingId from userFollows as uf
        where uf.followerId = ${userId}
    )
    group by p.postId
  )
  as a
  order by createdAt desc
  limit ${limit ?? 20}
  offset ${offset ?? 0}
    `;
};

export const testCase = () => {
  return `
    select p.postId, p.content, rp.createdAt
    from posts as p 
    inner join user_rePost as rp on rp.postId = p.postId
    where rp.userId in (
        select uf.followingId from userFollows as uf
        where uf.followerId = 1
    )
  `;
};

// * find following post origin
// `
// select p.postId, p.content, p.createdAt
//     from posts as p
//     inner join users AS u ON p.userId = u.userId
//     left join userFollows AS uf ON u.userId = uf.followerId
//     where uf.followerId = 1
// `

// ! Union
//   select * from (
//     select p.postId, p.content, p.createdAt from posts as p where userId = 1
//     union
//     select p.postId, p.content, rp.createdAt from posts as p inner join user_rePost as rp on rp.postId = p.postId where rp.userId = 1)
// a order by createdAt desc;

// * Test
// ! Cannot set to empty if null
// `
// select ${selectPostSQL},
//     p.createdAt, COALESCE(post_tags_join.tags, CAST('[]' AS JSON))
//     from posts as p
//   left join (
//     SELECT pt.postId, JSON_ARRAYAGG(t.tagName) as tags
//     FROM post_tag AS pt
//     INNER JOIN tag AS t ON t.tagId = pt.tagId
//     GROUP BY pt.postId
//   ) AS post_tags_join ON post_tags_join.postId = p.postId
//   where p.userId = ${userId}
//   GROUP BY p.postId
// `,

// * Can set to empty array
//       `
// SELECT ${selectPostSQL}, p.createdAt,
//   COALESCE(
//     (
//       SELECT JSON_ARRAYAGG(JSON_OBJECT('tagId', t.tagId, 'tagName', t.tagName))
//       FROM post_tag AS pt
//       INNER JOIN tag AS t ON t.tagId = pt.tagId
//       WHERE pt.postId = p.postId
//     ),
//     CAST('[]' AS JSON)
//   ) AS tags
// FROM posts AS p
// WHERE p.userId = ${userId}
// GROUP BY p.postId, ${selectPostSQL}, p.createdAt
// `,
