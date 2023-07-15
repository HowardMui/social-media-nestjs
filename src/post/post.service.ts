import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreatePostDTO, GetPostQueryParams } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService) {}

  // Basic CRUD ------------------------------------------------------------------------------------

  async getAllPostLists(query: GetPostQueryParams) {
    const { limit, offset, asc, desc, userId } = query;

    try {
      const findPosts = await this.prisma.post.findMany({
        skip: offset,
        take: limit,
        where: {
          userId: userId ? userId : undefined,
        },
      });

      // await this.prisma.post.aggregate({
      //   _count: {
      //     lik
      //   }
      // })

      const returnObject = {
        count: findPosts.length,
        rows: findPosts,
        limit,
        offset,
      };

      return returnObject;
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
      await this.prisma.userLikedPost.create({
        data: {
          postId,
          userId,
        },
      });
      // console.log(123);
      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Already liked by user');
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
    }
  }
}
