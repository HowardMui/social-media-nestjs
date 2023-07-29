import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetRecommendationQueryParams } from './dto';
import { RecommendationType } from 'src/types';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaSrcService) {}

  async getRecommendationList(query: GetRecommendationQueryParams) {
    const { limit, offset, asc, desc, type } = query;

    try {
      switch (type) {
        case RecommendationType.user:
          return await this.prisma.user.findMany({
            where: {},
            orderBy: { userName: 'desc' },
            skip: offset || 0,
            take: limit || 20,
            include: {
              posts: true,
            },
          });
      }
      // return await this.prisma.post.findMany({
      //   orderBy: returnAscOrDescInQueryParams(asc, desc) || {
      //     numOfUserLikes: 'desc',
      //   },
      //   skip: limit,
      //   take: offset,
      // });
    } catch (err) {
      console.log(err);
    }
  }

  // async getRecommendationTagList() {}
}
