import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  CreatePostDTO,
  GetPostQueryParamsWithFilter,
  PostResponse,
} from './dto';
import { returnAscOrDescInQueryParamsWithFilter } from 'src/helper';
import { Tag } from '@prisma/client';
import { ListResponse } from 'src/types';
import { RedisService } from 'src/redis/redis.service';
import { formatDataToRedis } from 'src/helper/format-data-to-redis';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaSrcService, private redis: RedisService) {}
  private readonly logger = new Logger(PostService.name);

  // * Basic CRUD ------------------------------------------------------------------------------------

  async getAllPostLists(query: GetPostQueryParamsWithFilter) {
    const { limit, offset, asc, desc, userName } = query;
    try {
      // * check if data is in cache:
      const cachedData = await this.redis.getRedisValue<
        ListResponse<PostResponse>
      >(`gap${formatDataToRedis<GetPostQueryParamsWithFilter>(query)}`);
      if (cachedData) {
        return cachedData;
      } else {
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
          limit: limit ?? 20,
          offset: offset ?? 0,
        };
        await this.redis.setRedisValue(
          `gap${formatDataToRedis<GetPostQueryParamsWithFilter>(query)}`,
          returnObject,
        );
        return returnObject;
      }
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
}
