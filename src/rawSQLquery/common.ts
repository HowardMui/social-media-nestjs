export const selectUserRawQuery = `
    u.userId as "users.userId",
    u.firstName as "users.firstName",
    u.lastName as "users.lastName",
    u.email as "users.email",
    u.userName as "users.userName",
    u.image as "users.image",
    u.bio as "users.bio",
    u.description as "users.description",
    u.createdAt as "users.createdAt",
    u.updatedAt as "users.updatedAt"
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
