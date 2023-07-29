import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetSearchQueryParams, SearchType } from './dto/search.dto';
import { returnAscOrDescInQueryParams } from 'src/helper';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaSrcService) {}

  async searchFn(query: GetSearchQueryParams) {
    try {
      const { limit, offset, keyword, type } = query;

      switch (type) {
        case SearchType.user:
          return await this.prisma.user.findMany({
            where: {
              OR: [
                {
                  userName: {
                    contains: keyword,
                  },
                },
              ],
            },
            orderBy: { userName: 'desc' },
            include: {
              posts: true,
            },
          });
        case SearchType.post:
        default:
          return await this.prisma.post.findMany({
            where: {
              OR: [
                {
                  content: {
                    contains: keyword,
                    mode: 'insensitive',
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
            orderBy: { content: 'desc' },
            include: {
              tags: true,
              // user: true,
            },
          });
        case SearchType.tag:
          const findPostWithTagName = await this.prisma.tag.findMany({
            where: {
              tagName: {
                contains: keyword,
                mode: 'insensitive',
              },
            },
            select: {
              posts: {
                orderBy: { createdAt: 'desc' },
              },
            },
          });

          const tempFilter = findPostWithTagName
            .flatMap((post) => post.posts)
            .filter(
              (post, index, setArr) =>
                setArr.findIndex((item) => item.postId === post.postId) ===
                index,
            );

          return tempFilter;
      }
    } catch (err) {
      console.log(err);
    }
  }
}
