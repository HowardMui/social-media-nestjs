import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  GetRecommendationQueryParamsWithFilter,
  RecommendationType,
} from './dto';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaSrcService) {}

  async getRecommendationList(query: GetRecommendationQueryParamsWithFilter) {
    const { limit, offset, type } = query;

    try {
      switch (type) {
        case RecommendationType.user:
          // * base on the given weights and sort by the total score
          const recommentedUsers = await this.prisma.$queryRaw`
          SELECT u.*,
          (COALESCE(UserPost."postCount"::integer, 0) * 8)
          + (COALESCE(UserRePost."rePostCount"::integer, 0) * 6)
          + (COALESCE(UserLikedPost."likedPostCount"::integer, 0) * 4)
          + (COALESCE(UserBookmarkedPost."bookmarkedPostCount"::integer, 0) * 2)
          + (COALESCE(UserCommentedPost."commentedPostCount"::integer, 0) * 3) AS "score"
           FROM "User" AS u
          LEFT JOIN (
            SELECT "userId", COUNT(*)::integer AS "postCount"
              FROM "Post"
              GROUP BY "userId"
          ) AS UserPost ON UserPost."userId" = u."userId"
          LEFT JOIN (
            SELECT "userId", COUNT(*)::integer AS "rePostCount"
              FROM "user_rePost_posts"
              GROUP BY "userId"
          ) AS UserRePost ON UserRePost."userId" = u."userId"
          LEFT JOIN (
            SELECT "userId", COUNT(*)::integer AS "likedPostCount"
              FROM "user_liked_posts"
              GROUP BY "userId"
          ) AS UserLikedPost ON UserLikedPost."userId" = u."userId"
          LEFT JOIN (
            SELECT "userId", COUNT(*)::integer AS "bookmarkedPostCount"
              FROM "user_bookmarked_posts"
              GROUP BY "userId"
          ) AS UserBookmarkedPost ON UserBookmarkedPost."userId" = u."userId"
          LEFT JOIN (
            SELECT "userId", COUNT(*)::integer AS "commentedPostCount"
              FROM "Comment"
              GROUP BY "userId"
          ) AS UserCommentedPost ON UserCommentedPost."userId" = u."userId"
          ORDER BY
            "score" DESC
            LIMIT ${limit || 20}
            OFFSET ${offset || 0}
        `;
          return recommentedUsers;

        case RecommendationType.post:
        default:
          const posts = await this.prisma.$queryRaw`
           SELECT
              p.*,
              pt."tags",
              COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
              COALESCE(lc.likesCount::integer, 0) AS "likesCount",
              COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount",
              (COALESCE(pc.commentsCount::integer, 0) * 2) 
              + (COALESCE(lc.likesCount::integer, 0) * 3) 
              + (COALESCE(rc.rePostsCount::integer, 0) * 4) AS "score"
            FROM
              "Post" p
            LEFT JOIN (
              SELECT "postId", COUNT(*) AS commentsCount
              FROM "Comment"
              GROUP BY "postId"
            ) pc ON pc."postId" = p."postId"
            LEFT JOIN (
              SELECT "postId", COUNT(*) AS likesCount
              FROM "user_liked_posts"
              GROUP BY "postId"
            ) lc ON lc."postId" = p."postId"
            LEFT JOIN (
              SELECT "postId", COUNT(*) AS rePostsCount
              FROM "user_rePost_posts"
              GROUP BY "postId"
            ) rc ON rc."postId" = p."postId"
            LEFT JOIN (
            SELECT p."postId", 
              CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
                ELSE '[]' END AS "tags"
              FROM "Post" p
              LEFT OUTER JOIN "_PostTags" ON p."postId" = "_PostTags"."A"
              LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
                GROUP BY p."postId"
            ) pt ON pt."postId" = p."postId"
            ORDER BY
            "score" DESC
            LIMIT ${limit || 20}
            OFFSET ${offset || 0}
            `;

          const returnObject = {
            rows: posts,
            limit: limit ?? 20,
            offset: offset ?? 0,
          };

          return returnObject;
        case RecommendationType.tag:
          const tagWeight = await this.prisma.$queryRaw`
            SELECT t."tagName", t."tagId", COUNT(p."postId")::integer AS "postCount"
            FROM "Tag" AS t
            LEFT JOIN (
              SELECT *
              FROM "_PostTags"
            ) AS pt ON pt."B" = t."tagId"
            LEFT JOIN (
              SELECT *
              FROM "Post"
            ) AS p ON p."postId" = pt."A"
            GROUP BY t."tagName", t."tagId"
            ORDER BY "postCount" DESC
          `;

          return tagWeight;
      }
    } catch (err) {
      console.log(err);
    }
  }
}
