import { rawQueryTagNameParams } from 'src/types';

export const countPostWithTagName = (tagName: string) => {
  return `
    select count(*) as count from tag as t
        inner join post_tag as pt on pt.tagId = t.tagId
        where t.tagName = '${tagName}';
    `;
};

export const getOneTagName = ({
  limit,
  offset,
  tagName,
}: rawQueryTagNameParams) => {
  return `
    select distinct t.tagId, t.tagName, t.createdAt, t.updatedAt,
        (select JSON_ARRAYAGG(JSON_OBJECT('postId',sub.postId, 'content', sub.content, 'image',sub.image, 'userId',sub.userId))
            from (
                select pt.postId, p.content, p.image, p.userId from
                post_tag AS pt
                inner join post AS p ON p.postId = pt.postId
                where pt.tagId = t.tagId
                limit ${limit ?? 20}
                offset ${offset ?? 0}
            ) as sub             
        ) as post
    FROM tag as t
    inner join post_tag as pt on pt.tagId = t.tagId
    where t.tagName = '${tagName}'
    `;
};
