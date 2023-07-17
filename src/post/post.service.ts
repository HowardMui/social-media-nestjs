import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreatePostDTO, GetPostQueryParams } from './dto';
import { returnAscOrDescInQueryParams } from 'src/helper';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService) {}

  // Basic CRUD ------------------------------------------------------------------------------------

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
      });

      const returnObject = {
        count: findPosts.length,
        rows: findPosts,
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
      const findPost = await this.prisma.post.findUnique({
        where: {
          postId,
        },
      });
      if (!findPost) {
        return new NotFoundException();
      }
      return findPost;
    } catch (err) {
      console.log(err);
    }
  }

  async createOnePost(body: CreatePostDTO, user) {
    try {
      return await this.prisma.post.create({
        data: { ...body, userId: user['userId'] },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteOneUserPost(postId: number) {
    try {
      await this.prisma.post.delete({
        where: { postId },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }

  // Like a post ------------------------------------------------------------------------------------
  async likeAPostByUser(postId: number, userId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          postId,
        },
        include: {
          likedByUser: true,
        },
      });

      if (post.likedByUser.find((user) => user.userId === userId)) {
        return new BadRequestException('Already liked by user');
      }

      await this.prisma.post.update({
        where: {
          postId,
        },
        data: {
          numOfUserLikes: {
            increment: 1,
          },
          likedByUser: {
            connect: {
              userId,
            },
          },
        },
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025' || err.code === 'P2016') {
        throw new NotFoundException('Post do not exist');
      } else {
        throw new BadRequestException('Already liked by user');
      }
    }
  }

  async unLikeAPost(postId: number, userId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          postId,
        },
        include: {
          likedByUser: true,
        },
      });

      if (!post.likedByUser.find((user) => user.userId === userId)) {
        return new BadRequestException(
          'Cannot unliked.  User do not liked yet',
        );
      }

      await this.prisma.post.update({
        where: {
          postId,
        },
        data: {
          likedByUser: {
            disconnect: {
              userId,
            },
          },
          numOfUserLikes: {
            decrement: 1,
          },
        },
      });
      // return post;
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }

  // Share a post to current User Blog ------------------------------------------------------------------------------------
  async rePostAPostToCurrentUserBlog(postId: number, userId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          postId,
        },
        include: {
          listUserRePost: true,
        },
      });

      if (post.listUserRePost.find((user) => user.userId === userId)) {
        return new BadRequestException('Already rePost by user');
      }

      const findPost = await this.prisma.post.update({
        where: {
          postId,
        },
        data: {
          listUserRePost: {
            connect: {
              userId,
            },
          },
          numOfUserRePost: {
            increment: 1,
          },
        },
      });
      return findPost;
    } catch (err) {
      console.log(err);
    }
  }

  async cancelRePostAPost(postId: number, userId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: {
          postId,
        },
        include: {
          listUserRePost: true,
        },
      });

      if (!post.listUserRePost.find((user) => user.userId === userId)) {
        return new BadRequestException('Did not rePosted by user');
      }

      const findPost = await this.prisma.post.update({
        where: {
          postId,
        },
        data: {
          listUserRePost: {
            disconnect: {
              userId,
            },
          },
          numOfUserRePost: {
            decrement: 1,
          },
        },
      });

      return findPost;
    } catch (err) {
      console.log(err);
    }
  }
}
