import { Injectable } from '@nestjs/common';
import { returnAscOrDescInQueryParams } from 'src/helper';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { CreateOneTagDTO, GetAllTagQueryParams } from './dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaSrcService) {}

  async getAllTagList(query: GetAllTagQueryParams) {
    const { limit, offset, asc, desc } = query;

    try {
      return await this.prisma.tag.findMany({
        orderBy: returnAscOrDescInQueryParams(asc, desc) || { tagId: 'desc' },
        skip: offset,
        take: limit,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async createOneTag(body: CreateOneTagDTO) {
    const { postId, tagName } = body;

    try {
      await this.prisma.tag.upsert({
        // if found, update.  if not, create it
        where: { tagName },
        create: {
          tagName,
          postCount: postId.length,
          posts: {
            connect: postId.map((id) => ({ postId: id })),
          },
        },
        update: {
          posts: {
            set: postId.map((id) => ({ postId: id })),
          },
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}
