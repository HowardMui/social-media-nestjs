import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';

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

  async validate(payload: { userId: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId: payload.userId,
      },
    });
    return user;
  }
}
