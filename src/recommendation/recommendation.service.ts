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
          return await this.prisma.user.findMany({
            where: {},
            orderBy: { userName: 'desc' },
            skip: offset || 0,
            take: limit || 20,
            include: {
              posts: true,
            },
          });
        case RecommendationType.post:
        default:
          // return await this.prisma.post.aggregate({
          //   _max: {
          //     numOfUserLikes: true,
          //   },
          //   where:{
          //     numOfUserLikes: {

          //     }
          //   }

          // });
          // return await this.prisma.post.findMany({
          //   where: {},
          //   orderBy: [{ numOfUserRePost: 'desc' }, { numOfUserLikes: 'desc' }],
          //   skip: offset || 0,
          //   take: limit || 20,
          //   // select:{
          //   //   _count
          //   // }
          // });
          // return await this.prisma.post.findMany({
          //   orderBy: [{ numOfUserRePost: 'desc' }, { numOfUserLikes: 'desc' }],
          //   skip: offset || 0,
          //   take: limit || 20,
          //   include: {
          //     _count: {
          //       select: {
          //         likedByUser: true,
          //         comments: true,
          //         bookmarkedByUser: true,
          //       },
          //     },
          //   },
          // });
          // const posts = await this.prisma
          //   .$queryRaw`SELECT * FROM "user_liked_posts"`;
          const posts = await this.prisma.$queryRaw`
           SELECT
              p.*,
              pt."tags",
              COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
              COALESCE(lc.likesCount::integer, 0) AS "likesCount",
              COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount",
              (COALESCE(pc.commentsCount::integer, 0) * 2) + (COALESCE(lc.likesCount::integer, 0) * 3) + (COALESCE(rc.rePostsCount::integer, 0) * 4) AS "score"
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

          // return posts.map(({ score, ...post }) => post);
          return posts;
        case RecommendationType.tag:
          return await this.prisma.user.findMany({
            where: {},
            orderBy: { userName: 'desc' },
            skip: offset || 0,
            take: limit || 20,
            include: {
              posts: true,
            },
          });
      }
      // return await this.prisma.post.findMany({
      //   orderBy: returnAscOrDescInQueryParamsWithFilter(asc, desc) || {
      //     numOfUserLikes: 'desc',
      //   },
      //   skip: limit,
      //   take: offset,
      // });
    } catch (err) {
      console.log(err);
    }
  }

  // async getRecommendationTagList() {}
}
