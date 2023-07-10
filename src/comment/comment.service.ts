import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaSrcService) {}

  async getCommentList(postId: number) {
    try {
      // await
    } catch (err) {
      console.log(err);
    }
  }
}
