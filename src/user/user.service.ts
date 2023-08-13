import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaSrcService } from '../prisma-src/prisma-src.service';
import { GetUserListQueryParams } from './dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { returnAscOrDescInQueryParamsWithFilter } from 'src/helper';
import { GetUserPostEnum, GetUserPostQuery } from './dto/user-post.dto';
import { PostResponse } from 'src/post/dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaSrcService) {}

  // * User CRUD ------------------------------------------------------------------------------------------------

  async getUserList(query: GetUserListQueryParams) {
    const { limit, offset, asc, desc } = query;

    try {
      const userList = await this.prisma.user.findMany({
        orderBy: returnAscOrDescInQueryParamsWithFilter(asc, desc) || {
          userId: 'desc',
        },
        skip: offset ?? 0,
        take: limit ?? 20,
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });

      const transformedUserList = userList.map(({ _count, ...user }) => ({
        ...user,
        followersCount: _count.followers,
        followingCount: _count.following,
      }));

      const returnObject = {
        count: transformedUserList.length,
        rows: transformedUserList,
        limit: limit ?? 20,
        offset: offset ?? 0,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
    }
  }

  async getOneUser(userId: number) {
    try {
      const findOneUser = await this.prisma.user.findUnique({
        where: {
          userId,
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });
      if (!findOneUser) {
        return new NotFoundException();
      }

      const { _count, ...user } = findOneUser;

      const transformedUser = {
        followingCount: _count.following,
        followersCount: _count.followers,
      };

      return { ...user, ...transformedUser };
    } catch (err) {
      console.log(err);
    }
  }

  async getOneUserPostDetail(userId: number, query: GetUserPostQuery) {
    const { limit, offset, postType } = query;

    try {
      switch (postType) {
        case GetUserPostEnum.Posts:
        default:
          // TODO raw SQL
          // * UNION ALl
          const findAllUserRePost: PostResponse[] = await this.prisma.$queryRaw`
          SELECT "Post".*, pt."tags",
              COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
              COALESCE(lc.likesCount::integer, 0) AS "likesCount",
              COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount"
            FROM "User"
            LEFT JOIN "user_rePost_posts" ON "User"."userId" = "user_rePost_posts"."userId"
            LEFT JOIN "Post" ON "Post"."postId" = "user_rePost_posts"."postId"
            LEFT JOIN (
              SELECT "Post"."postId", 
              CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
                ELSE '[]' END AS "tags"
              FROM "Post"
            LEFT OUTER JOIN "_PostTags" ON "Post"."postId" = "_PostTags"."A"
            LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
              GROUP BY "Post"."postId"
            ) pt ON pt."postId" = "Post"."postId"
            LEFT JOIN (
              SELECT
                "postId",
                COUNT(*) AS commentsCount
              FROM
                "Comment"
              GROUP BY
                "postId"
              ) pc ON pc."postId" = "Post"."postId"
            LEFT JOIN (
              SELECT
                "postId",
                COUNT(*) AS likesCount
              FROM
                "user_liked_posts"
              GROUP BY
                "postId"
              ) lc ON lc."postId" = "Post"."postId"
            LEFT JOIN (
              SELECT
                "postId",
                COUNT(*) AS rePostsCount
              FROM
                "user_rePost_posts"
              GROUP BY
                "postId"
              ) rc ON rc."postId" = "Post"."postId"
            WHERE "User"."userId" = ${userId}
            UNION ALL
          SELECT "Post".*, pt."tags",
              COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
              COALESCE(lc.likesCount::integer, 0) AS "likesCount",
              COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount"
            FROM "User"
            LEFT JOIN "Post" ON "Post"."userId" = "User"."userId"
            LEFT JOIN (
              SELECT "Post"."postId", 
              CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
                ELSE '[]' END AS "tags"
              FROM "Post"
              LEFT OUTER JOIN "_PostTags" ON "Post"."postId" = "_PostTags"."A"
              LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
              GROUP BY "Post"."postId"
            ) pt ON pt."postId" = "Post"."postId"
            LEFT JOIN (
                SELECT
                  "postId",
                  COUNT(*) AS commentsCount
                FROM
                  "Comment"
                GROUP BY
                  "postId"
                ) pc ON pc."postId" = "Post"."postId"
              LEFT JOIN (
              SELECT
                "postId",
                COUNT(*) AS likesCount
              FROM
                "user_liked_posts"
              GROUP BY
                "postId"
              ) lc ON lc."postId" = "Post"."postId"
            LEFT JOIN (
              SELECT
                "postId",
                COUNT(*) AS rePostsCount
              FROM
                "user_rePost_posts"
              GROUP BY
                "postId"
              ) rc ON rc."postId" = "Post"."postId"
            WHERE "User"."userId" = ${userId}
            ORDER BY "createdAt" DESC
            LIMIT ${limit || 20}
            OFFSET ${offset || 0}
            `;

          const returnPostObject = {
            count: findAllUserRePost.length,
            rows: findAllUserRePost,
            limit,
            offset,
          };
          return returnPostObject;
        case GetUserPostEnum.Likes:
          const findLikedPost = await this.prisma.userLikedPost.findMany({
            where: {
              userId,
            },
            skip: offset ?? 0,
            take: limit ?? 20,
            select: {
              post: {
                include: {
                  user: true,
                  tags: true,
                  _count: {
                    select: {
                      likedByUser: true,
                      comments: true,
                      bookmarkedByUser: true,
                      rePostedByUser: true,
                    },
                  },
                },
              },
            },
          });

          const transformedPosts = findLikedPost.map(({ post }) => {
            const { _count, ...rest } = post;
            return {
              ...rest,
              tags: post.tags.map((t) => t.tagName),
              likedCount: _count.likedByUser,
              commentCount: _count.comments,
              bookmarkedCount: _count.bookmarkedByUser,
              rePostedCount: _count.rePostedByUser,
            };
          });

          const returnLikedPostObject = {
            count: findLikedPost.length,
            rows: transformedPosts,
            limit: limit ?? 0,
            offset: offset ?? 20,
          };

          return returnLikedPostObject;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async updateOneUser(userId: number, dto: UpdateUserDTO) {
    try {
      return await this.prisma.user.update({
        where: { userId },
        data: dto,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteOneUser(userId: number) {
    try {
      await this.prisma.user.delete({
        where: {
          userId,
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }

  // * Follow user action ---------------------------------------------------------------------------------------------------

  async followOneUser(wannaFollowId: number, currentUserId: number) {
    try {
      await this.prisma.user.update({
        where: {
          userId: wannaFollowId,
        },
        data: {
          followers: {
            connect: {
              userId: currentUserId,
            },
          },
        },
      });
      return 'Followed user';
    } catch (err) {
      console.log(err);
    }
  }

  async unFollowOneUser(wannaUnFollowId: number, currentUserId: number) {
    try {
      await this.prisma.user.update({
        where: {
          userId: wannaUnFollowId,
        },
        data: {
          followers: {
            disconnect: {
              userId: currentUserId,
            },
          },
        },
      });
      return 'UnFollowed user';
    } catch (err) {
      console.log(err);
    }
  }
}
