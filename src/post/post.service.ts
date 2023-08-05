import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreatePostDTO, GetPostQueryParams } from './dto';
import { returnAscOrDescInQueryParams } from 'src/helper';
import { Tag } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService) {}

  // * Basic CRUD ------------------------------------------------------------------------------------

  async getAllPostLists(query: GetPostQueryParams) {
    const { limit, offset, asc, desc, userId } = query;

    try {
      const findPosts = await this.prisma.post.findMany({
        orderBy: returnAscOrDescInQueryParams(asc, desc) || { postId: 'desc' },
        skip: offset,
        take: limit,
        where: {
          userId: userId ? userId : undefined,
        },
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
      });

      const transformedPosts = findPosts.map(({ _count, ...post }) => ({
        ...post,
        likedCount: _count.likedByUser,
        commentCount: _count.comments,
        bookmarkedCount: _count.bookmarkedByUser,
        rePostedCount: _count.rePostedByUser,
      }));

      const returnObject = {
        count: findPosts.length,
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
      const { _count, ...rest } = findAPost;
      const transformedPosts = {
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
      let tempExistedTags: Tag[] = [];
      let willBeCreatedTag: string[] = [];

      if (tagName && tagName.length > 0) {
        tempExistedTags = await this.prisma.tag.findMany({
          where: {
            tagName: {
              in: tagName,
            },
          },
        });

        willBeCreatedTag = tagName.filter(
          (tag) =>
            !tempExistedTags.some((existTag) => existTag.tagName === tag),
        );
      }

      // Create a new post
      await this.prisma.post.create({
        data: {
          ...postBody,
          userId,
          tags:
            tagName && tagName.length > 0
              ? {
                  connect: tempExistedTags.map((tag) => ({
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
      if (err.code === 'P2025' || err.code === 'P2016') {
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
