import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetSearchQueryParamsWithFilter } from './dto/search.dto';
import { SearchType } from 'src/types';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaSrcService) {}

  async searchFn(query: GetSearchQueryParamsWithFilter) {
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
          const latestPostList = await this.prisma.post.findMany({
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
              user: true,
              _count: {
                select: {
                  likedByUser: true,
                  comments: true,
                  bookmarkedByUser: true,
                  rePostOrderByUser: true,
                },
              },
            },
          });

          const transformedPosts = latestPostList.map(
            ({ _count, tags, ...post }) => ({
              ...post,
              tags: tags.map((t) => t.tagName),
              likedCount: _count.likedByUser,
              commentCount: _count.comments,
              bookmarkedCount: _count.bookmarkedByUser,
              rePostedCount: _count.rePostOrderByUser,
            }),
          );
          return transformedPosts;
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
                include: {
                  tags: true,
                  user: true,
                  _count: {
                    select: {
                      likedByUser: true,
                      comments: true,
                      bookmarkedByUser: true,
                      rePostOrderByUser: true,
                    },
                  },
                },
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
            )
            .map(({ _count, tags, ...post }) => {
              return {
                ...post,
                tags: tags.map((t) => t.tagName),
                likedCount: _count.likedByUser,
                commentCount: _count.comments,
                bookmarkedCount: _count.bookmarkedByUser,
                rePostedCount: _count.rePostOrderByUser,
              };
            });

          return tempFilter;
      }
    } catch (err) {
      console.log(err);
    }
  }
}
