import { Inject, Injectable, Req, Scope } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaSrcService) {}
}
