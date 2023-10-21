export const selectUserRawQuery = `
    u.userId as "user.userId",
    u.firstName as "user.firstName",
    u.lastName as "user.lastName",
    u.email as "user.email",
    u.userName as "user.userName",
    u.image as "user.image",
    u.bio as "user.bio",
    u.description as "user.description",
    u.createdAt as "user.createdAt",
    u.updatedAt as "user.updatedAt"
`;

export const selectPostRawQuery = `
    p.postId, p.content, p.image, p.userId
`;

export const selectTagRawQuery = `
    COALESCE(
    (
        SELECT JSON_ARRAYAGG(t.tagName)
        FROM post_tag AS pt
        INNER JOIN tag AS t ON t.tagId = pt.tagId
        WHERE pt.postId = p.postId
    ),
    CAST('[]' AS JSON)
    ) AS tags
`;
