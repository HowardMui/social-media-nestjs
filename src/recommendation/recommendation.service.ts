import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  RecommendationPostFilter,
  RecommendationTagFilter,
  RecommendationUserFilter,
} from './dto';
import { RedisService } from 'src/redis/redis.service';
import { GetAllTagResponse } from 'src/tag/dto';
import { UserResponse } from 'src/user/dto';
import { ListResponseWithoutCount, RedisKey } from 'src/types';
import { PostResponse } from 'src/post/dto';
import { formatDataToRedis, formatListResponseObject } from 'src/helper';
import { InjectModel } from '@nestjs/sequelize';
import { PostModel, TagModel, UserModel } from 'src/models';
import { Sequelize } from 'sequelize-typescript';
import { recommendUserList } from 'src/rawSQLquery';

@Injectable()
export class RecommendationService {
  constructor(
    private prisma: PrismaSrcService,
    private redis: RedisService,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(TagModel)
    private tagModel: typeof TagModel,
    private sequelize: Sequelize,
  ) {}

  // ! old version of User repost joining
  // async getRecommendationList(query: GetRecommendationQueryParamsWithFilter) {
  //   const { limit, offset, type } = query;

  //   try {
  //     switch (type) {
  //       case RecommendationType.用戶:
  //         // * gru = get recommend users
  //         const cacheRecommendationUsers = await this.redis.getRedisValue<
  //           ListResponseWithoutCount<UserResponse>
  //         >(
  //           `gru${formatDataToRedis<GetRecommendationQueryParamsWithFilter>(
  //             query,
  //           )}`,
  //         );
  //         if (cacheRecommendationUsers) {
  //           return cacheRecommendationUsers;
  //         } else {
  //           // * base on the given weights and sort by the total score
  //           const recommendedUsers = await this.prisma.$queryRaw`
  //           SELECT u.*,
  //           (COALESCE(UserPost."postCount"::integer, 0) * 8)
  //           + (COALESCE(UserRePost."rePostCount"::integer, 0) * 6)
  //           + (COALESCE(UserLikedPost."likedPostCount"::integer, 0) * 4)
  //           + (COALESCE(UserBookmarkedPost."bookmarkedPostCount"::integer, 0) * 2)
  //           + (COALESCE(UserCommentedPost."commentedPostCount"::integer, 0) * 3) AS "score"
  //            FROM "User" AS u
  //           LEFT JOIN (
  //             SELECT "userId", COUNT(*)::integer AS "postCount"
  //               FROM "Post"
  //               GROUP BY "userId"
  //           ) AS UserPost ON UserPost."userId" = u."userId"
  //           LEFT JOIN (
  //             SELECT "userId", COUNT(*)::integer AS "rePostCount"
  //               FROM "user_rePost_posts"
  //               GROUP BY "userId"
  //           ) AS UserRePost ON UserRePost."userId" = u."userId"
  //           LEFT JOIN (
  //             SELECT "userId", COUNT(*)::integer AS "likedPostCount"
  //               FROM "user_liked_posts"
  //               GROUP BY "userId"
  //           ) AS UserLikedPost ON UserLikedPost."userId" = u."userId"
  //           LEFT JOIN (
  //             SELECT "userId", COUNT(*)::integer AS "bookmarkedPostCount"
  //               FROM "user_bookmarked_posts"
  //               GROUP BY "userId"
  //           ) AS UserBookmarkedPost ON UserBookmarkedPost."userId" = u."userId"
  //           LEFT JOIN (
  //             SELECT "userId", COUNT(*)::integer AS "commentedPostCount"
  //               FROM "Comment"
  //               GROUP BY "userId"
  //           ) AS UserCommentedPost ON UserCommentedPost."userId" = u."userId"
  //           ORDER BY
  //             "score" DESC
  //             LIMIT ${limit ?? 20}
  //             OFFSET ${offset ?? 0}
  //         `;
  //           const returnFormattedUsers = {
  //             rows: recommendedUsers,
  //             limit: limit ?? 20,
  //             offset: offset ?? 0,
  //           };
  //           await this.redis.setRedisValue(
  //             `gru${formatDataToRedis<GetRecommendationQueryParamsWithFilter>(
  //               query,
  //             )}`,
  //             returnFormattedUsers,
  //           );
  //           return returnFormattedUsers;
  //         }

  //       case RecommendationType.帖文:
  //       default:
  //         // * grp = get recommend posts
  //         const cacheRecommendationPosts = await this.redis.getRedisValue<
  //           ListResponseWithoutCount<PostResponse>
  //         >(
  //           `grp${formatDataToRedis<GetRecommendationQueryParamsWithFilter>(
  //             query,
  //           )}`,
  //         );
  //         if (cacheRecommendationPosts) {
  //           return cacheRecommendationPosts;
  //         } else {
  //           const findRecommendPosts = await this.prisma.$queryRaw`
  //            SELECT
  //               p.*,
  //               pt."tags",
  //               pu."user" AS "user",
  //               COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
  //               COALESCE(lc.likesCount::integer, 0) AS "likesCount",
  //               COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount",
  //               (COALESCE(pc.commentsCount::integer, 0) * 2)
  //               + (COALESCE(lc.likesCount::integer, 0) * 3)
  //               + (COALESCE(rc.rePostsCount::integer, 0) * 4) AS "score"
  //             FROM
  //               "Post" p
  //             LEFT JOIN (
  //               SELECT "postId", COUNT(*) AS commentsCount
  //               FROM "Comment"
  //               GROUP BY "postId"
  //             ) pc ON pc."postId" = p."postId"
  //             LEFT JOIN (
  //               SELECT "postId", COUNT(*) AS likesCount
  //               FROM "user_liked_posts"
  //               GROUP BY "postId"
  //             ) lc ON lc."postId" = p."postId"
  //             LEFT JOIN (
  //               SELECT "postId", COUNT(*) AS rePostsCount
  //               FROM "user_rePost_posts"
  //               GROUP BY "postId"
  //             ) rc ON rc."postId" = p."postId"
  //             LEFT JOIN (
  //             SELECT p."postId",
  //               CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
  //                 ELSE '[]' END AS "tags"
  //               FROM "Post" p
  //               LEFT OUTER JOIN "_PostTags" ON p."postId" = "_PostTags"."A"
  //               LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
  //                 GROUP BY p."postId"
  //             ) pt ON pt."postId" = p."postId"
  //             LEFT JOIN (
  //               SELECT pu."userId", jsonb_build_object(
  //                 'userId', pu."userId",
  //                 'firstName', pu."firstName",
  //                 'lastName', pu."lastName",
  //                 'email', pu."email",
  //                 'userName', pu."userName",
  //                 'image', pu."image",
  //                 'bio', pu."bio",
  //                 'description', pu."description",
  //                 'isVerified', pu."isVerified",
  //                 'createdAt', pu."createdAt",
  //                 'updatedAt', pu."updatedAt",
  //                 'deletedAt', pu."deletedAt"
  //               ) AS "user"
  //               FROM "User" pu
  //             ) pu ON pu."userId" = p."userId"
  //             ORDER BY
  //             "score" DESC
  //             LIMIT ${limit || 20}
  //             OFFSET ${offset || 0}
  //             `;
  //           const returnFormattedPosts = {
  //             rows: findRecommendPosts,
  //             limit: limit ?? 20,
  //             offset: offset ?? 0,
  //           };
  //           await this.redis.setRedisValue(
  //             `grp${formatDataToRedis<GetRecommendationQueryParamsWithFilter>(
  //               query,
  //             )}`,
  //             returnFormattedPosts,
  //           );
  //           return returnFormattedPosts;
  //         }

  //       case RecommendationType.標籤:
  //         // * grt = get recommend tags
  //         const cacheRecommendationTag = await this.redis.getRedisValue<
  //           ListResponseWithoutCount<
  //             Omit<GetAllTagResponse, 'createAt' | 'updatedAt'>
  //           >
  //         >(
  //           `grt${formatDataToRedis<GetRecommendationQueryParamsWithFilter>(
  //             query,
  //           )}`,
  //         );
  //         if (cacheRecommendationTag) {
  //           return cacheRecommendationTag;
  //         } else {
  //           const recommendedTag = await this.prisma.tag.findMany({
  //             include: {
  //               _count: {
  //                 select: {
  //                   posts: true,
  //                 },
  //               },
  //             },
  //             orderBy: {
  //               posts: {
  //                 _count: 'desc',
  //               },
  //             },
  //             skip: offset ?? 0,
  //             take: limit ?? 20,
  //           });

  //           const formatTag = recommendedTag.map(
  //             ({ _count, tagId, tagName }) => {
  //               return {
  //                 tagId,
  //                 tagName,
  //                 postCount: _count.posts,
  //               };
  //             },
  //           );
  //           const returnFormattedTags = {
  //             rows: formatTag,
  //             limit: limit ?? 20,
  //             offset: offset ?? 0,
  //           };
  //           await this.redis.setRedisValue(
  //             `grt${formatDataToRedis<GetRecommendationQueryParamsWithFilter>(
  //               query,
  //             )}`,
  //             returnFormattedTags,
  //           );
  //           return returnFormattedTags;
  //         }

  // ! In case need to calculate tag weight, need to use queryRaw
  // const tagWeight = await this.prisma.$queryRaw`
  //   SELECT t."tagName", t."tagId", COUNT(p."postId")::integer AS "postCount"
  //   FROM "Tag" AS t
  //   LEFT JOIN (
  //     SELECT *
  //     FROM "_PostTags"
  //   ) AS pt ON pt."B" = t."tagId"
  //   LEFT JOIN (
  //     SELECT *
  //     FROM "Post"
  //   ) AS p ON p."postId" = pt."A"
  //   GROUP BY t."tagName", t."tagId"
  //   ORDER BY "postCount" DESC
  // `;

  // return tagWeight;
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  async getRecommendationPostList(query: RecommendationPostFilter) {
    try {
      const { limit, offset } = query;

      // * grp = get recommend posts
      // const cacheRecommendationPosts = await this.redis.getRedisValue<
      //   ListResponseWithoutCount<PostResponse>
      // >(`grp${formatDataToRedis<RecommendationPostFilter>(query)}`);
      // if (cacheRecommendationPosts) {
      //   return cacheRecommendationPosts;
      // } else {
      // const findRecommendPosts = await this.prisma.$queryRaw`
      //     SELECT
      //       p.*,
      //       pt."tags",
      //       pu."user" AS "user",
      //       COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
      //       COALESCE(lc.likesCount::integer, 0) AS "likesCount",
      //       COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount",
      //       (COALESCE(pc.commentsCount::integer, 0) * 2)
      //       + (COALESCE(lc.likesCount::integer, 0) * 3)
      //       + (COALESCE(rc.rePostsCount::integer, 0) * 4) AS "postScore"
      //     FROM
      //       "Post" p
      //     LEFT JOIN (
      //       SELECT "postId", COUNT(*) AS commentsCount
      //       FROM "Comment"
      //       GROUP BY "postId"
      //     ) pc ON pc."postId" = p."postId"
      //     LEFT JOIN (
      //       SELECT "postId", COUNT(*) AS likesCount
      //       FROM "user_liked_posts"
      //       GROUP BY "postId"
      //     ) lc ON lc."postId" = p."postId"
      //     LEFT JOIN (
      //       SELECT "rePostId", COUNT(*) AS rePostsCount
      //       FROM "UserPostOrder"
      //       WHERE "rePostId" IS NOT NULL
      //       GROUP BY "rePostId"
      //     ) rc ON rc."rePostId" = p."postId"
      //     LEFT JOIN (
      //     SELECT p."postId",
      //       CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
      //         ELSE '[]' END AS "tags"
      //       FROM "Post" p
      //       LEFT OUTER JOIN "_PostTags" ON p."postId" = "_PostTags"."A"
      //       LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
      //         GROUP BY p."postId"
      //     ) pt ON pt."postId" = p."postId"
      //     LEFT JOIN (
      //       SELECT pu."userId", jsonb_build_object(
      //         'userId', pu."userId",
      //         'firstName', pu."firstName",
      //         'lastName', pu."lastName",
      //         'email', pu."email",
      //         'userName', pu."userName",
      //         'image', pu."image",
      //         'bio', pu."bio",
      //         'description', pu."description",
      //         'isVerified', pu."isVerified",
      //         'createdAt', pu."createdAt",
      //         'updatedAt', pu."updatedAt",
      //         'deletedAt', pu."deletedAt"
      //       ) AS "user"
      //       FROM "User" pu
      //     ) pu ON pu."userId" = p."userId"
      //     ORDER BY
      //     "postScore" DESC
      //     LIMIT ${limit || 20}
      //     OFFSET ${offset || 0}
      //     `;
      // const response = formatListResponseObject({
      //   rows: findRecommendPosts,
      //   limit: limit ?? 20,
      //   offset: offset ?? 0,
      // });
      // await this.redis.setRedisValue(
      //   `grp${formatDataToRedis<RecommendationPostFilter>(query)}`,
      //   response,
      // );
      // return response;
      // }
    } catch (err) {
      console.log(err);
    }
  }

  async getRecommendationUserList(
    query: RecommendationUserFilter,
    userId?: number,
  ) {
    try {
      const { limit, offset } = query;

      // * gru = get recommend users
      // const cacheRecommendationUsers = await this.redis.getRedisValue<
      //   ListResponseWithoutCount<UserResponse>
      // >(`gru${formatDataToRedis<RecommendationUserFilter>(query)}`);
      // if (cacheRecommendationUsers) {
      //   return cacheRecommendationUsers;
      // } else {
      // * base on the given weights and sort by the total score

      // TODO raw query

      const user = await this.sequelize.query(
        recommendUserList({
          limit,
          offset,
          userId,
        }),
        {
          nest: true,
        },
      );

      const response = {
        rows: user,
        limit,
        offset,
      };

      // await this.redis.setRedisValue(
      //   formatDataToRedis<RecommendationUserFilter>({
      //     filter: query,
      //     keyword: RedisKey.推薦用戶,
      //     userId,
      //   }),
      //   response,
      // );

      return response;
      // }
    } catch (err) {
      console.log(err);
    }
  }

  async getRecommendationTagList(
    query: RecommendationTagFilter,
    userId?: number,
  ) {
    try {
      const { limit, offset } = query;
      // const cacheRecommendationTag = await this.redis.getRedisValue<
      //   ListResponseWithoutCount<
      //     Omit<GetAllTagResponse, 'createAt' | 'updatedAt'>
      //   >
      // >(
      //   formatDataToRedis<RecommendationTagFilter>({
      //     filter: query,
      //     keyword: RedisKey.推薦標籤,
      //     userId,
      //   }),
      // );
      // if (cacheRecommendationTag) {
      //   return cacheRecommendationTag;
      // } else {
      const { count, rows } = await this.tagModel.findAndCountAll({
        distinct: true,
        subQuery: false,
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM post_tag AS pt WHERE pt.tagId = TagModel.tagId)`,
              ),
              'postCount',
            ],
          ],
        },
        include: [
          {
            model: PostModel,
            attributes: [],
          },
        ],
        order: [['postCount', 'DESC']],
        limit: limit ?? 20,
        offset: offset ?? 0,
      });

      const response = {
        count,
        rows,
        limit,
        offset,
      };

      // await this.redis.setRedisValue(
      //   formatDataToRedis<RecommendationTagFilter>({
      //     filter: query,
      //     keyword: RedisKey.推薦標籤,
      //   }),
      //   response,
      // );
      return response;
      // }
    } catch (err) {
      console.log(err);
    }
  }
}
