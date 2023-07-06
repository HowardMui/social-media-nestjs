import { Inject, Injectable, Param, Req, Scope } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PrismaSrcService } from '../prisma-src/prisma-src.service';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaSrcService) {}

  async getUserList() {
    try {
      return await this.prisma.user.findMany({});
    } catch (err) {
      console.log(err);
    }
  }

  async deleteAllUser() {
    try {
      return await this.prisma.user.deleteMany();
    } catch (err) {
      console.log(err);
    }
  }
}
