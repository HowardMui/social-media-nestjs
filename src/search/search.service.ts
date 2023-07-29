import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetSearchQueryParams, SearchType } from './dto/search.dto';

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
            skip: offset || 0,
            take: limit || 20,
            include: {
              posts: true,
            },
          });
        case SearchType.latest:
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
            orderBy: [{ createdAt: 'desc' }, { content: 'desc' }],
            skip: offset || 0,
            take: limit || 20,
            include: {
              tags: true,
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
            skip: offset || 0,
            take: limit || 20,
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
