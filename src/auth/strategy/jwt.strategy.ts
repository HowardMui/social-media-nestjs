import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaSrcService } from '../../prisma-src/prisma-src.service';

interface JwtPayload {
  userId?: number;
  adminId?: number;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaSrcService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req.cookies.token) {
            return req.cookies.token;
          } else {
            return null;
          }
        },
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const { userId, adminId } = payload;
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });
      return user;
    } else if (adminId) {
      const admin = await this.prisma.admin.findUnique({
        where: {
          adminId,
        },
      });
      return admin;
    }
  }
}
