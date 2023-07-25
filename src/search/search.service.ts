import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetSearchQueryParams } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaSrcService) {}

  async searchFn(query: GetSearchQueryParams) {
    try {
      const { limit, offset, keyword } = query;

      const posts = await this.prisma.post.findMany({
        where: {
          OR: [
            {
              content: {
                contains: keyword,
              },
            },
            {
              tags: {
                some: {
                  tagName: {
                    contains: keyword,
                  },
                },
              },
            },
          ],
        },
        include: {
          tags: true,
          // user: true,
        },
      });

      const tags = await this.prisma.tag.findMany({
        where: {
          tagName: {
            contains: keyword,
          },
        },
        include: {
          posts: true,
        },
      });

      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            // {
            //   firstName: {
            //     contains: keyword,
            //   },
            // },
            // {
            //   lastName: {
            //     contains: keyword,
            //   },
            // },
            {
              userName: {
                contains: keyword,
              },
            },
          ],
        },
        include: {
          posts: true,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
