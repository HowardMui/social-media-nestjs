import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaSrcService) {}

  async bookmarkOnePost(postId: number, user) {
    try {
      await this.prisma.userBookmark.create({
        data: {
          postId,
          userId: user.userId,
        },
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
    }
  }
}
