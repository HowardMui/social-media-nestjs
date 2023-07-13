import { HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaSrcService) {}

  async bookmarkOnePost(postId: number, user) {
    try {
      await this.prisma.bookmark.create({
        data: {
          postId,
          userId: user.userId,
        },
      });

      //   const findUser = await this.prisma.user.findUnique({
      //     where: {
      //       userId: user.userId,
      //     },
      //     include: {
      //       bookmarks: true,
      //     },
      //   });

      //   console.log(findUser);
      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
    }
  }
}
