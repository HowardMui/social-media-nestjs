import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaSrcService } from '../prisma-src/prisma-src.service';
import { GetUserQueryParams, UpdateUserDTO } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaSrcService) {}

  async getUserList(query: GetUserQueryParams) {
    const { limit, offset, asc, desc } = query;

    try {
      const userList = await this.prisma.user.findMany({
        skip: offset ?? 0,
        take: limit ?? 20,
        // include: {
        //   posts: true,
        //   bookmarks: true,
        //   likes: true,
        // },
      });

      const returnObject = {
        count: userList.length,
        rows: userList,
        limit: limit ?? 20,
        offset: offset ?? 0,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
    }
  }

  async updateOneUser(userId: number, dto: UpdateUserDTO) {
    try {
      return await this.prisma.user.update({
        where: { userId },
        data: dto,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async deleteOneUser(userId: number) {
    try {
      await this.prisma.user.delete({
        where: {
          userId,
        },
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }
}
