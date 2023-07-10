import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreatePostDTO, PostQueryParams } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService) {}

  async getAllPostLists(query: PostQueryParams) {
    const { limit, offset, asc, desc, userId } = query;

    try {
      const findPosts = await this.prisma.post.findMany({
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
}
