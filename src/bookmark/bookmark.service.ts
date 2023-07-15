import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaSrcService) {}

  async bookmarkOnePost(postId: number, user) {
    try {
      const createData = await this.prisma.userBookmark.create({
        data: {
          postId,
          userId: user.userId,
        },
        select: {
          post: true,
        },
      });

      // return createData.post;
      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Already bookmarked by user');
    }
  }

  async deleteOneBookmark(postId: number, user) {
    try {
      await this.prisma.userBookmark.delete({
        where: {
          postId_userId: {
            postId,
            userId: user.userId,
          },
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }
}
