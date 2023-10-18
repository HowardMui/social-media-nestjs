import { rawQueryParams } from 'src/types';

export const recommendUserList = ({ limit, offset }: rawQueryParams) => {
  return `
        select u.*,
        IFNULL(up.postCount * 8, 0) + IFNULL(urp.rePostCount * 6, 0) + 
        IFNULL(ulp.likePostCount * 4, 0) + IFNULL(ubp.bookmarkCount * 2, 0) AS score
             from users as u
        left join (select userId, count(*) as 'postCount' from posts group by userId) as up on u.userId = up.userId
        left join (select userId, count(*) as 'rePostCount' from user_rePost group by userId) as urp on u.userId = urp.userId
        left join (select userId, count(*) as 'likePostCount' from user_likePost group by userId) as ulp on u.userId = ulp.userId
        left join (select userId, count(*) as 'bookmarkCount' from user_bookmarkPost group by userId) as ubp on u.userId = ubp.userId
        order by score desc
        limit ${limit ?? 20}
        offset ${offset ?? 0}
    `;
};
