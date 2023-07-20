import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetRecommendationQueryParams } from './dto';
import { returnAscOrDescInQueryParams } from 'src/helper';

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaSrcService) {}

  async getRecommendationPostList(query: GetRecommendationQueryParams) {
    const { limit, offset, asc, desc } = query;

    try {
      return await this.prisma.post.findMany({
        orderBy: returnAscOrDescInQueryParams(asc, desc) || {
          numOfUserLikes: 'desc',
        },
        skip: limit,
        take: offset,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
