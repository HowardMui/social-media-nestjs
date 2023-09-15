import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreatePostDTO, GetPostQueryParamsWithFilter } from './dto';
import { returnAscOrDescInQueryParamsWithFilter } from 'src/helper';
import { Tag } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService) {}

  // * Basic CRUD ------------------------------------------------------------------------------------

  async getAllPostLists(query: GetPostQueryParamsWithFilter) {
    const { limit, offset, asc, desc, userName } = query;

    try {
      const [totalPosts, findPosts] = await this.prisma.$transaction([
        this.prisma.post.count({
          where: {
            OR: [
              {
                user: {
                  userName: {
                    contains: userName ? userName : undefined,
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
                  userName: {
                    contains: userName ? userName : undefined,
                  },
                },
              },
            ],
          },
          orderBy: returnAscOrDescInQueryParamsWithFilter(asc, desc) || {
            postId: 'desc',
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
                rePostedByUser: true,
              },
            },
          },
        }),
      ]);

      const transformedPosts = findPosts.map(({ _count, tags, ...post }) => ({
        ...post,
        tags: tags.map((t) => t.tagName),
        likedCount: _count.likedByUser,
        commentCount: _count.comments,
        bookmarkedCount: _count.bookmarkedByUser,
        rePostedCount: _count.rePostedByUser,
      }));

      const returnObject = {
        count: totalPosts,
        rows: transformedPosts,
        limit,
        offset,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
      if (err.message.includes('Unknown arg')) {
        throw new BadRequestException(
          `Invalid orderBy field: ${
            err.message.split('Unknown arg')[1].split(' in ')[0]
          }}`,
        );
      }
    }
  }

  async getOnePost(postId: number) {
    try {
      //TODO Test get all post tag with SQL
      // const fineOnePost = await this.prisma.$queryRaw`
      // SELECT "Post".*, JSON_AGG(DISTINCT jsonb_build_object('tagId',"Tag"."tagId", 'tagName',"Tag"."tagName")) AS "tags"
      //   FROM "Post"
      //   LEFT OUTER JOIN "_PostTags" ON "Post"."postId" = "_PostTags"."A"
      //   LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
      //   WHERE "Post"."postId" = ${postId}
      //   GROUP BY "Post"."postId"
      //   `;
      // return fineOnePost;

      // * origin
      const findAPost = await this.prisma.post.findUnique({
        where: {
          postId,
        },
        include: {
          tags: true,
          comments: true,
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
      });
      if (!findAPost) {
        return new NotFoundException('Post do not exist');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _count, tags, comments, ...rest } = findAPost;
      const transformedPosts = {
        tags: tags.map((t) => t.tagName),
        likedCount: _count.likedByUser,
        commentCount: _count.comments,
        bookmarkedCount: _count.bookmarkedByUser,
        rePostedCount: _count.rePostedByUser,
      };
      return { ...rest, ...transformedPosts };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async createOnePost(body: CreatePostDTO, userId: number) {
    const { tagName, ...postBody } = body;

    try {
      let existedTags: Tag[] = [];
      let willBeCreatedTag: string[] = [];

      // * Filter exist nor not-exist tag
      if (tagName && tagName.length > 0) {
        existedTags = await this.prisma.tag.findMany({
          where: {
            tagName: {
              in: tagName,
            },
          },
        });

        willBeCreatedTag = tagName.filter(
          (tag) => !existedTags.some((existTag) => existTag.tagName === tag),
        );
      }

      // * Create a new post
      await this.prisma.post.create({
        data: {
          ...postBody,
          userId,
          tags:
            tagName && tagName.length > 0
              ? {
                  connect: existedTags.map((tag) => ({
                    tagName: tag.tagName,
                  })),
                  create: willBeCreatedTag.map((tag) => ({
                    tagName: tag,
                  })),
                }
              : undefined,
        },
        include: {
          tags: true,
        },
      });

      return HttpStatus.CREATED;
    } catch (err) {
      console.log(err);
    }
  }

  async deleteOnePost(postId: number) {
    try {
      await this.prisma.post.delete({
        where: { postId },
      });

      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025' || err.code === 'P2016') {
        throw new NotFoundException('Post do not exist');
      }
      throw err;
    }
  }

  // * Like a post ------------------------------------------------------------------------------------

  async likeAPostByUser(postId: number, userId: number) {
    try {
      await this.prisma.userLikedPost.create({
        data: {
          postId,
          userId,
        },
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      if (
        err.code === 'P2003' ||
        err.code === 'P2025' ||
        err.code === 'P2016'
      ) {
        throw new NotFoundException('Post do not exist');
      } else if (err.code === 'P2002') {
        throw new BadRequestException('Already liked by user');
      } else {
        throw err;
      }
    }
  }

  async unLikeAPost(postId: number, userId: number) {
    try {
      await this.prisma.userLikedPost.delete({
        where: {
          userId_postId: {
            postId,
            userId,
          },
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('Like or post record do not exist');
      } else {
        throw err;
      }
    }
  }

  // * Share a post to current User Blog ------------------------------------------------------------------------------------

  async rePostAPostToCurrentUserBlog(postId: number, userId: number) {
    try {
      await this.prisma.userRePost.create({
        data: {
          postId,
          userId,
        },
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2002') {
        throw new BadRequestException('Already rePosted by user');
      } else {
        throw err;
      }
    }
  }

  async cancelRePostAPost(postId: number, userId: number) {
    try {
      await this.prisma.userRePost.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025') {
        throw new NotFoundException('rePost or post record do not exist');
      } else {
        throw err;
      }
    }
  }
}
