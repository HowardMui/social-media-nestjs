import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  GetOneUserPost,
  GetMeBookmarkedPost,
  UpdateUserProfileDTO,
  UserProfileAuthDto,
  GetMeLikedQueryParam,
  GetMeFollowingQueryParam,
  GetMeFollowersQueryParam,
} from './dto';
import { Request, Response } from 'express';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as _ from 'lodash';

@Injectable()
export class MeService {
  constructor(
    private prisma: PrismaSrcService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // * Auth ------------------------------------------------------------------------------------

  async userSignIn(dto: UserProfileAuthDto, res: Response) {
    const { email, password } = dto;

    try {
      const findUser = await this.prisma.user.findUnique({
        where: { email },
        include: { UserAuths: true },
      });

      if (!findUser) {
        return new ForbiddenException('Cannot find user');
      }

      //Compare hash password
      const passwordMatch = await argon.verify(
        findUser.UserAuths[0].hash,
        password,
      );
      if (!passwordMatch) {
        return new ForbiddenException('Error in email or password');
      }

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
    } catch (err) {
      console.log(err);
    }
  }

  async userSignUp(dto: UserProfileAuthDto) {
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
      const transformedMe = {
        ...rest,
        followersCount: _count.followers,
        followingCount: _count.following,
      };

      return transformedMe;
    } catch (err) {
      console.log(err);
    }
  }

  async updateMe(req: Request, dto: UpdateUserProfileDTO) {
    try {
      const testUpdate = await this.prisma.user.update({
        where: {
          userId: req.user['userId'],
        },
        data: dto,
      });
      console.log(testUpdate);
      return testUpdate;
    } catch (err) {
      console.log(err);
    }
  }

  // * Follower or Following Action ---------------------------------------------------------------------

  async getUserFollowers(userId: number, query: GetMeFollowersQueryParam) {
    const { limit, offset } = query;

    try {
      const currentUser = await this.prisma.user.findUnique({
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
          _count: {
            select: {
              followers: true,
            },
          },
        },
      });

      // * Add isFollowing boolean into return list
      const followersList = currentUser.followers.map(
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

      const returnObject = {
        count: followersList.length,
        rows: followersList,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getUserFollowing(userId: number, query: GetMeFollowingQueryParam) {
    const { limit, offset } = query;
    try {
      const findFollowing = await this.prisma.user.findUnique({
        where: {
          userId,
        },
        select: {
          following: {
            skip: offset || 0,
            take: limit || 20,
          },
        },
      });

      const returnObject = {
        count: findFollowing.following.length,
        rows: findFollowing.following,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // * bookmark Action ------------------------------------------------------------------------------------

  async getAllMeBookmarkList(query: GetMeBookmarkedPost, userId: number) {
    const { limit, offset } = query;

    try {
      const findBookmarkPost = await this.prisma.userBookmark.findMany({
        where: {
          userId,
        },
        skip: offset ?? 0,
        take: limit ?? 20,
        select: {
          post: {
            include: {
              user: true,
            },
          },
        },
      });

      const returnObject = {
        count: findBookmarkPost.length,
        rows: findBookmarkPost.map((item) => item.post),
        limit: limit ?? 0,
        offset: offset ?? 20,
      };
      return returnObject;
    } catch (err) {
      console.log(err);
    }
  }

  // * like Action ------------------------------------------------------------------------------------

  async getMeLikedPostList(query: GetMeLikedQueryParam, userId: number) {
    const { limit, offset } = query;

    try {
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

      const transformedPosts = _.map(findLikedPost, ({ post }) => {
        const { _count, ...rest } = post;
        return {
          ...rest,
          likedCount: _count.likedByUser,
          commentCount: _count.comments,
          bookmarkedCount: _count.bookmarkedByUser,
          rePostedCount: _count.rePostedByUser,
        };
      });

      const returnObject = {
        count: findLikedPost.length,
        rows: transformedPosts,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
    }
  }

  // * Find all current user post ------------------------------------------------------------------------------------

  async getAllMePost(query: GetOneUserPost, userId: number) {
    const { limit, offset, asc, desc } = query;

    try {
      //* adjusted new data list
      // const findUserWithRePost = await this.prisma.user.findMany({
      //   where: {
      //     userId,
      //   },

      //   select: {
      //     // skip: offset ?? 0,
      //     posts: {
      //       include: {
      //         user: true,
      //         tags: true,
      //         _count: {
      //           select: {
      //             likedByUser: true,
      //             comments: true,
      //             bookmarkedByUser: true,
      //             rePostedByUser: true,
      //           },
      //         },
      //       },
      //       orderBy: {
      //         postId: 'desc',
      //       },
      //       skip: offset ?? 0,
      //       take: limit ?? 20,
      //     },
      //     rePosts: {
      //       select: {
      //         post: {
      //           include: {
      //             user: true,
      //             tags: true,
      //             _count: {
      //               select: {
      //                 likedByUser: true,
      //                 comments: true,
      //                 bookmarkedByUser: true,
      //                 rePostedByUser: true,
      //               },
      //             },
      //           },
      //         },
      //       },
      //       orderBy: {
      //         post: {
      //           postId: 'desc',
      //         },
      //       },
      //       skip: offset ?? 0,
      //       take: limit ?? 20,
      //     },
      //   },
      // });

      // return findUserWithRePost;

      // const transformedPosts = findUserWithRePost
      //   .flatMap(({ posts, rePosts }) => [
      //     ...posts,
      //     ...rePosts.map((repost) => repost.post),
      //   ])
      //   .map(({ _count, ...post }) => ({
      //     ...post,
      //     likedCount: _count.likedByUser,
      //     commentCount: _count.comments,
      //     bookmarkedCount: _count.bookmarkedByUser,
      //     rePostedCount: _count.rePostedByUser,
      //   }));

      // return _.orderBy(transformedPosts, ['createdAt'], ['desc']);

      // TODO raw SQL
      // * UNION ALl (Need)
      const findAllUserRePost = await this.prisma.$queryRaw`
       SELECT "Post".*, pt."tags",
          COALESCE(pc.commentsCount::integer, 0) AS "commentsCount",
          COALESCE(lc.likesCount::integer, 0) AS "likesCount",
          COALESCE(rc.rePostsCount::integer, 0) AS "rePostsCount"
        FROM "User"
        LEFT JOIN "user_rePost_posts" ON "User"."userId" = "user_rePost_posts"."userId"
        LEFT JOIN "Post" ON "Post"."postId" = "user_rePost_posts"."postId"
        LEFT JOIN (
          SELECT "Post"."postId", 
          CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG(DISTINCT jsonb_build_object('tagId', "Tag"."tagId", 'tagName', "Tag"."tagName"))
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
          CASE WHEN COUNT("Tag"."tagId") > 0 THEN JSON_AGG(DISTINCT jsonb_build_object('tagId', "Tag"."tagId", 'tagName', "Tag"."tagName"))
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
      return findAllUserRePost;

      // * origin data list

      // const findUser = await this.prisma.user.findUnique({
      //   where: {
      //     userId,
      //   },
      //   include: {
      //     posts: {
      //       orderBy: { createdAt: 'desc' },
      //       skip: offset ?? 0,
      //       take: limit ?? 20,
      //     },
      //     rePosts: {
      //       select: {
      //         post: true,
      //       },
      //       orderBy: {
      //         post: {
      //           createdAt: 'desc',
      //         },
      //       },
      //       skip: offset ?? 0,
      //       take: limit ?? 20,
      //     },
      //   },
      // });

      // return findUser;
      // // return findUserWithRePost;

      // const sortPost = await this.prisma.post.findMany({
      //   where: {
      //     OR: [
      //       { userId },
      //       {
      //         postId: {
      //           in: findUser.rePosts.map((repost) => repost.post.postId),
      //         },
      //       },
      //     ],
      //   },
      //   orderBy: { createdAt: 'desc' },
      //   skip: offset ?? 0,
      //   take: limit ?? 20,
      // });
      // return sortPost;
    } catch (err) {
      console.log(err);
    }
  }
}
