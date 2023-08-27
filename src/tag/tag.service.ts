import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  CreateOneTagDTO,
  GetAllTagQueryParamsWithFilter,
  UpdateOneTagDTO,
} from './dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaSrcService) {}

  async getAllTagList(query: GetAllTagQueryParamsWithFilter) {
    const { limit, offset, tagName } = query;

    try {
      const findTagList = await this.prisma.tag.findMany({
        where: tagName
          ? {
              OR: [
                {
                  tagName: {
                    contains: tagName,
                  },
                },
              ],
            }
          : undefined,
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: { tagId: 'desc' },
        skip: offset || 0,
        take: limit || 20,
      });

      const formatListResult = {
        count: findTagList.length,
        rows: findTagList.map(({ _count, ...rest }) => {
          return { ...rest, postCount: _count.posts };
        }),
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      return formatListResult;
    } catch (err) {
      console.log(err);
    }
  }

  // * May be remove (Don't know usage)
  // async getOneTag(tagName: string) {
  //   try {
  //     const findTag = await this.prisma.tag.findUnique({
  //       where: {
  //         tagName,
  //       },
  //       include: {
  //         posts: true,
  //       },
  //     });

  //     if (!findTag) {
  //       return new NotFoundException();
  //     }
  //     return findTag;
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }

  async getPostListInOneTag(query, tagName: string) {
    const { limit, offset } = query;
    try {
      const findTag = await this.prisma.tag.findUnique({
        where: {
          tagName,
        },
        include: {
          posts: {
            skip: offset || 0,
            take: limit || 20,
          },
        },
      });

      if (!findTag) {
        return new NotFoundException();
      }
      return findTag;
    } catch (err) {
      console.log(err);
    }
  }

  async createOneTag(body: CreateOneTagDTO) {
    const { postId, tagName } = body;

    try {
      return await this.prisma.tag.upsert({
        // if found, update.  if not, create it
        where: { tagName },
        create: {
          tagName,
          // postCount: postId.length,
          posts: {
            connect: postId.map((id) => ({ postId: id })),
          },
        },
        update: {
          // postCount: postId.length,
          posts: {
            set: postId.map((id) => ({ postId: id })),
          },
        },
      });
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025' || err.code === 'P2016') {
        throw new NotFoundException('Post do not exist');
      }
    }
  }

  async updateOneTag(tagNameParam: string, body: UpdateOneTagDTO) {
    const { postId, tagName } = body;
    try {
      await this.prisma.tag.update({
        where: {
          tagName: tagNameParam,
        },
        data: {
          tagName,
          // postCount: postId.length,
          posts: {
            set: postId.map((id) => ({ postId: id })),
          },
        },
      });
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025' || err.code === 'P2016') {
        throw new NotFoundException('Tag do not exist');
      }
    }
  }

  async deleteOneTag(tagName: string) {
    try {
      await this.prisma.tag.delete({
        where: {
          tagName,
        },
      });
      return { status: HttpStatus.OK, message: 'Deleted' };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025' || err.code === 'P2016') {
        throw new NotFoundException('Tag do not exist');
      }
    }
  }
}
