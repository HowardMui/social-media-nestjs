import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  GetMeLikedQueryParams,
  GetMeFollowingQueryParams,
  GetMeFollowersQueryParams,
  GetMePostQueryParams,
  GetMeBookmarkedQueryParams,
  UserSignInDTO,
  UserSignUpDTO,
  GetMeCommentQueryParams,
  GetMeCommentResponse,
  GetMeFollowingResponse,
  GetMeFollowersResponse,
} from './dto';
import { Request, Response } from 'express';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';
import { PostResponse } from 'src/post/dto';
import { UpdateMeProfileDTO } from './dto/me-update-profile.dto';
import {
  formatResponseListData,
  formatDataToRedis,
  formatDevice,
  formatListResponseObject,
} from 'src/helper';
import { RedisService } from 'src/redis/redis.service';
import { ListResponse } from 'src/types';

@Injectable()
export class MeService {
  constructor(
    private prisma: PrismaSrcService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  // * Auth ------------------------------------------------------------------------------------

  async userSignIn(
    dto: UserSignInDTO,
    res: Response,
    signInIpAddress: string,
    req: Request,
  ) {
    const { email, password } = dto;
    const { client, device, os } = formatDevice(req);
    try {
      await this.prisma.$transaction(async (tx) => {
        // * 1. Find user
        const findUser = await tx.user.findUnique({
          where: { email },
          include: { UserAuths: true },
        });

        if (!findUser) {
          throw new ForbiddenException('Cannot find user');
        } else if (!findUser.UserAuths.length) {
          throw new ForbiddenException('Invalid user.  Please find Admin');
        }

        // * 2. Compare hash password
        const passwordMatch = await argon.verify(
          findUser.UserAuths[0].hash,
          password,
        );
        if (!passwordMatch) {
          throw new ForbiddenException('Error in email or password');
        }

        // * 3. Add record to log table
        await tx.logTable.create({
          data: {
            userId: findUser.userId,
            userType: 'user',
            ipAddress: signInIpAddress,
            device: `${device.type}-${device.brand}-${os.name}-${os.version}-${client.type}-${client.name}-${client.version}`,
          },
        });

        res
          .status(200)
          .cookie(
            'token',
            (await this.userSignToken(findUser.userId, findUser.email))
              .access_token,
            {
              httpOnly: true,
              sameSite: 'none',
              secure: true,
            },
          );
      });
      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async userSignUp(dto: UserSignUpDTO) {
    const { email, password, userName } = dto;

    try {
      // Generate hash password
      const hash = await argon.hash(password);

      // Create new User
      const newUser = await this.prisma.user.create({
        data: {
          userName,
          email,
          UserAuths: {
            create: {
              hash,
              email,
            },
          },
        },
        include: {
          UserAuths: true,
        },
      });

      return newUser;
    } catch (err) {
      console.log(err);

      if (err.code === 'P2002') {
        throw new ForbiddenException('Email already exist');
      }

      throw err;
    }
  }

  async logout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json('logout successfully');
  }

  async userSignToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      algorithm: 'HS256',
      expiresIn: '180 days',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  // * User Action ------------------------------------------------------------------------------------

  async getCurrentUserProfile(currentUserId: number) {
    try {
      // * gmpf = get me profile
      const cacheMeProfile =
        await this.redis.getRedisValue<GetMeFollowersResponse>(`gmpf`);
      if (cacheMeProfile) {
        return cacheMeProfile;
      } else {
        const findMe = await this.prisma.user.findUnique({
          where: {
            userId: currentUserId,
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
        const { _count, ...rest } = findMe;
        const formattedProfile = {
          ...rest,
          followersCount: _count.followers,
          followingCount: _count.following,
        };
        await this.redis.setRedisValue(`gmpf`, formattedProfile);
        return formattedProfile;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async updateMe(req: Request, dto: UpdateMeProfileDTO) {
    try {
      const testUpdate = await this.prisma.user.update({
        where: {
          userId: req.user['userId'],
        },
        data: dto,
      });
      return testUpdate;
    } catch (err) {
      console.log(err);
    }
  }

  // * Follower or Following Action ---------------------------------------------------------------------

  async getUserFollowers(userId: number, query: GetMeFollowersQueryParams) {
    const { limit, offset } = query;

    try {
      // * gmfe = get my followers
      const cacheFollowersData = await this.redis.getRedisValue<
        ListResponse<GetMeFollowersResponse>
      >(`gmfe${formatDataToRedis<GetMeFollowersQueryParams>(query, userId)}`);
      if (cacheFollowersData) {
        return cacheFollowersData;
      } else {
        const [totalFollowers, followersList] = await this.prisma.$transaction([
          this.prisma.user.findUnique({
            where: {
              userId,
            },
            select: {
              _count: {
                select: {
                  followers: true,
                },
              },
            },
          }),
          this.prisma.user.findUnique({
            where: {
              userId,
            },
            select: {
              followers: {
                skip: offset || 0,
                take: limit || 20,
                include: {
                  followers: true,
                },
              },
            },
          }),
        ]);
        // * Add isFollowing boolean into return list
        const formatFollowersList = followersList.followers.map(
          ({ followers, ...restFollower }) => {
            const isFollowing = followers.some(
              (eachUserInFollowers) => eachUserInFollowers.userId === userId,
            );
            return {
              ...restFollower,
              isFollowing,
            };
          },
        );

        const response = {
          count: totalFollowers._count.followers,
          rows: formatFollowersList,
          limit: limit ?? 0,
          offset: offset ?? 20,
        };
        await this.redis.setRedisValue(
          `gmfe${formatDataToRedis<GetMeFollowersQueryParams>(query, userId)}`,
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserFollowing(userId: number, query: GetMeFollowingQueryParams) {
    const { limit, offset } = query;
    try {
      // * gmfi = get my following
      const cacheFollowingData = await this.redis.getRedisValue<
        ListResponse<GetMeFollowingResponse>
      >(`gmfi${formatDataToRedis<GetMeFollowingQueryParams>(query, userId)}`);
      if (cacheFollowingData) {
        return cacheFollowingData;
      } else {
        const [totalFollowing, followingList] = await this.prisma.$transaction([
          // * Find one and find total
          this.prisma.user.findUnique({
            where: {
              userId,
            },
            select: {
              _count: {
                select: {
                  following: true,
                },
              },
            },
          }),
          this.prisma.user.findUnique({
            where: {
              userId,
            },
            select: {
              following: {
                skip: offset || 0,
                take: limit || 20,
                include: {
                  followers: true,
                },
              },
            },
          }),
        ]);

        // * Add isFollowing boolean into return list
        const transformFollowingList = followingList.following.map(
          ({ followers, ...restFollower }) => {
            const isFollowing = followers.some(
              (eachUserInFollowers) => eachUserInFollowers.userId === userId,
            );
            return {
              ...restFollower,
              isFollowing,
            };
          },
        );

        const response = {
          count: totalFollowing._count.following,
          rows: transformFollowingList,
          limit: limit ?? 0,
          offset: offset ?? 20,
        };
        await this.redis.setRedisValue(
          `gmfi${formatDataToRedis<GetMeFollowingQueryParams>(query, userId)}`,
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // * bookmark Action ------------------------------------------------------------------------------------

  async getAllMeBookmarkList(
    query: GetMeBookmarkedQueryParams,
    userId: number,
  ) {
    const { limit, offset } = query;

    try {
      // * gmpb = get my post bookmark
      const cachedBookmarkedData = await this.redis.getRedisValue<
        ListResponse<PostResponse>
      >(`gmpb${formatDataToRedis<GetMeBookmarkedQueryParams>(query, userId)}`);
      if (cachedBookmarkedData) {
        return cachedBookmarkedData;
      } else {
        const [totalBookmarkedPost, bookmarkedPostList] =
          await this.prisma.$transaction([
            this.prisma.userBookmark.count({
              where: {
                userId,
              },
            }),
            this.prisma.post.findMany({
              where: {
                bookmarkedByUser: {
                  some: {
                    userId,
                  },
                },
              },
              skip: offset ?? 0,
              take: limit ?? 20,
              include: {
                user: true,
                tags: true,
                _count: {
                  select: {
                    likedByUser: true,
                    comments: true,
                    bookmarkedByUser: true,
                    rePostOrderByUser: true,
                  },
                },
              },
            }),
          ]);

        const response = formatListResponseObject({
          rows: bookmarkedPostList.map((post) => formatResponseListData(post)),
          count: totalBookmarkedPost,
          limit,
          offset,
        });
        await this.redis.setRedisValue(
          `gmpb${formatDataToRedis<GetMeBookmarkedQueryParams>(query, userId)}`,
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
    }
  }

  // * like Action ------------------------------------------------------------------------------------

  async getMeLikedPostList(query: GetMeLikedQueryParams, userId: number) {
    const { limit, offset } = query;

    try {
      // * gmpl = get my post like
      const cachedLikedPostData = await this.redis.getRedisValue<
        ListResponse<PostResponse>
      >(`gmpl${formatDataToRedis<GetMeLikedQueryParams>(query, userId)}`);
      if (cachedLikedPostData) {
        return cachedLikedPostData;
      } else {
        const [totalLikedPost, likedPostList] = await this.prisma.$transaction([
          this.prisma.userLikedPost.count({
            where: {
              userId,
            },
          }),
          this.prisma.userLikedPost.findMany({
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
                      rePostOrderByUser: true,
                    },
                  },
                },
              },
            },
          }),
        ]);

        const response = formatListResponseObject({
          rows: likedPostList.map((post) => formatResponseListData(post)),
          count: totalLikedPost,
          limit,
          offset,
        });
        await this.redis.setRedisValue(
          `gmpl${formatDataToRedis<GetMeLikedQueryParams>(query, userId)}`,
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
    }
  }

  // * Find all current user post ------------------------------------------------------------------------------------

  async getAllMePost(query: GetMePostQueryParams, userId: number) {
    const { limit, offset } = query;

    try {
      // ! Raw prisma sql query, old version of User repost joining
      // const cachedAllMePostData = await this.redis.getRedisValue<
      //   ListResponse<PostResponse>
      // >(`gamp${formatDataToRedis<GetMePostQueryParams>(query)}`);
      // if (cachedAllMePostData) {
      //   return cachedAllMePostData;
      // } else {
      //   const postsQuery = await this.prisma.$queryRaw<
      //     { count: number; rows: PostResponse[] }[]
      //   >`
      //       WITH "Posts" AS (
      //         SELECT "Post".*, pt."tags",
      //           COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
      //           COALESCE(lc.likesCount::integer, 0) AS "likesCount",
      //           COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount"
      //         FROM "User"
      //         LEFT JOIN "user_rePost_posts" ON "User"."userId" = "user_rePost_posts"."userId"
      //         LEFT JOIN "Post" ON "Post"."postId" = "user_rePost_posts"."postId"
      //         LEFT JOIN (
      //           SELECT "Post"."postId",
      //             CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
      //               ELSE '[]' END AS "tags"
      //           FROM "Post"
      //           LEFT OUTER JOIN "_PostTags" ON "Post"."postId" = "_PostTags"."A"
      //           LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
      //           GROUP BY "Post"."postId"
      //         ) pt ON pt."postId" = "Post"."postId"
      //         LEFT JOIN (
      //           SELECT
      //             "postId",
      //             COUNT(*) AS commentsCount
      //           FROM
      //             "Comment"
      //           GROUP BY
      //             "postId"
      //         ) pc ON pc."postId" = "Post"."postId"
      //         LEFT JOIN (
      //           SELECT
      //             "postId",
      //             COUNT(*) AS likesCount
      //           FROM
      //             "user_liked_posts"
      //           GROUP BY
      //             "postId"
      //         ) lc ON lc."postId" = "Post"."postId"
      //         LEFT JOIN (
      //           SELECT
      //             "postId",
      //             COUNT(*) AS rePostsCount
      //           FROM
      //             "user_rePost_posts"
      //           GROUP BY
      //             "postId"
      //         ) rc ON rc."postId" = "Post"."postId"
      //         WHERE "User"."userId" = ${userId}
      //         -- // * UNION All (Combine two different table and query)
      //         UNION ALL
      //         SELECT "Post".*, pt."tags",
      //           COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
      //           COALESCE(lc.likesCount::integer, 0) AS "likesCount",
      //           COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount"
      //         FROM "User"
      //         LEFT JOIN "Post" ON "Post"."userId" = "User"."userId"
      //         LEFT JOIN (
      //           SELECT "Post"."postId",
      //             CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG("Tag"."tagName")
      //               ELSE '[]' END AS "tags"
      //           FROM "Post"
      //           LEFT OUTER JOIN "_PostTags" ON "Post"."postId" = "_PostTags"."A"
      //           LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
      //           GROUP BY "Post"."postId"
      //         ) pt ON pt."postId" = "Post"."postId"
      //         LEFT JOIN (
      //           SELECT
      //             "postId",
      //             COUNT(*) AS commentsCount
      //           FROM
      //             "Comment"
      //           GROUP BY
      //             "postId"
      //         ) pc ON pc."postId" = "Post"."postId"
      //         LEFT JOIN (
      //           SELECT
      //             "postId",
      //             COUNT(*) AS likesCount
      //           FROM
      //             "user_liked_posts"
      //           GROUP BY
      //             "postId"
      //         ) lc ON lc."postId" = "Post"."postId"
      //         LEFT JOIN (
      //           SELECT
      //             "postId",
      //             COUNT(*) AS rePostsCount
      //           FROM
      //             "user_rePost_posts"
      //           GROUP BY
      //             "postId"
      //         ) rc ON rc."postId" = "Post"."postId"
      //         WHERE "User"."userId" = ${userId}
      //         -- ORDER BY "createdAt" DESC
      //         -- LIMIT ${limit || 20}
      //         -- OFFSET ${offset || 0}
      //       ),
      //       -- // * find out the query and filter it
      //       "PaginatedPosts" AS (
      //         SELECT *
      //         FROM "Posts"
      //         ORDER BY "createdAt" DESC
      //         LIMIT ${limit || 20}
      //         OFFSET ${offset || 0}
      //       ),
      //       -- // * reform the the data into rows and count (count form the Posts -> avoid involve into the pagination)
      //       "AggregatedPosts" AS (
      //         SELECT json_agg("PaginatedPosts") AS "rows", (SELECT COUNT(*) FROM "Posts")::integer AS "count"
      //         FROM "PaginatedPosts"
      //       )
      //       SELECT "count", "rows"
      //       FROM "AggregatedPosts";
      //     `;
      //   const returnAllPostObject = {
      //     count: postsQuery[0].count,
      //     rows: postsQuery[0].rows,
      //     limit: limit ?? 20,
      //     offset: offset ?? 0,
      //   };
      //   await this.redis.setRedisValue(
      //     `gamp${formatDataToRedis<GetMePostQueryParams>(query)}`,
      //     returnAllPostObject,
      //   );
      //   return returnAllPostObject;
      // }

      // * gamp = get all my posts
      const cachedAllMePostData = await this.redis.getRedisValue<
        ListResponse<PostResponse>
      >(`gamp${formatDataToRedis<GetMePostQueryParams>(query, userId)}`);
      if (cachedAllMePostData) {
        return cachedAllMePostData;
      } else {
        const [postCount, postList] = await this.prisma.$transaction([
          this.prisma.userPostOrder.count({
            where: {
              userId,
            },
          }),
          this.prisma.userPostOrder.findMany({
            where: {
              userId,
            },
            include: {
              post: {
                include: {
                  tags: {
                    select: {
                      tagName: true,
                    },
                  },
                  user: true,
                  _count: {
                    select: {
                      likedByUser: true,
                      comments: true,
                      bookmarkedByUser: true,
                      rePostOrderByUser: true,
                    },
                  },
                },
              },
              rePost: {
                include: {
                  tags: {
                    select: {
                      tagName: true,
                    },
                  },
                  user: true,
                  _count: {
                    select: {
                      likedByUser: true,
                      comments: true,
                      bookmarkedByUser: true,
                      rePostOrderByUser: true,
                    },
                  },
                },
              },
              user: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
            skip: offset ?? 0,
            take: limit ?? 20,
          }),
        ]);

        const response = formatListResponseObject({
          rows: postList.map((post) =>
            post.rePostId
              ? formatResponseListData(post.rePost)
              : formatResponseListData(post.post),
          ),
          count: postCount,
          limit,
          offset,
        });

        await this.redis.setRedisValue(
          `gamp${formatDataToRedis<GetMePostQueryParams>(query, userId)}`,
          response,
        );
        return response;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getAllMeComment(query: GetMeCommentQueryParams, userId: number) {
    const { limit, offset } = query;

    try {
      // * gmcl = get my comment list
      const cachedMeCommentList = await this.redis.getRedisValue<
        ListResponse<GetMeCommentResponse>
      >(`gmcl${formatDataToRedis<GetMeCommentQueryParams>(query, userId)}`);
      if (cachedMeCommentList) {
        return cachedMeCommentList;
      } else {
        const [postCount, postListWithComment] = await this.prisma.$transaction(
          [
            this.prisma.post.count({
              where: {
                comments: {
                  some: {
                    userId,
                  },
                },
              },
            }),
            this.prisma.post.findMany({
              where: {
                comments: {
                  some: {
                    userId,
                  },
                },
              },
              include: {
                user: true,
                tags: true,
                comments: {
                  where: {
                    userId,
                  },
                  include: {
                    parentComment: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    likedByUser: true,
                    comments: true,
                    bookmarkedByUser: true,
                    rePostOrderByUser: true,
                  },
                },
              },
            }),
          ],
        );

        const response = formatListResponseObject({
          count: postCount,
          rows: postListWithComment.map((post) => formatResponseListData(post)),
          limit,
          offset,
        });

        await this.redis.setRedisValue(
          `gmcl${formatDataToRedis<GetMeCommentQueryParams>(query, userId)}`,
          response,
        );

        return response;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getAllMeFollowingPostList(query: GetMePostQueryParams, userId: number) {
    const { limit, offset } = query;

    // ! Prisma currently not support the m-n relationship ordered by, need a fix in future
    try {
      const [postCount, postList] = await this.prisma.$transaction([
        this.prisma.post.count({
          where: {
            OR: [
              {
                user: {
                  followers: {
                    some: {
                      userId,
                    },
                  },
                },
              },
              {
                rePostOrderByUser: {
                  some: {
                    user: {
                      followers: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        }),
        this.prisma.post.findMany({
          where: {
            OR: [
              {
                user: {
                  followers: {
                    some: {
                      userId,
                    },
                  },
                },
              },
              {
                rePostOrderByUser: {
                  some: {
                    user: {
                      followers: {
                        some: {
                          userId,
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
          include: {
            user: true,
            tags: {
              select: {
                tagName: true,
              },
            },
            rePostOrderByUser: {
              where: {
                user: {
                  followers: {
                    some: {
                      userId,
                    },
                  },
                },
              },
              include: {
                user: true,
              },
            },
            _count: {
              select: {
                bookmarkedByUser: true,
                likedByUser: true,
                rePostOrderByUser: true,
                comments: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      ]);

      return formatListResponseObject({
        rows: postList.map((post) => formatResponseListData(post)),
        count: postCount,
        limit,
        offset,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
