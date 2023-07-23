import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaSrcService) {}

  async searchFn() {
    try {
    } catch (err) {
      console.log(err);
    }
  }
}
