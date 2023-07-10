import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { PostQueryParams } from './dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService) {}

  async getAllPostLists(query: PostQueryParams) {
    const { limit, offset, asc, desc, userId } = query;

    try {
      const findPosts = await this.prisma.tweet.findMany({
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
}
