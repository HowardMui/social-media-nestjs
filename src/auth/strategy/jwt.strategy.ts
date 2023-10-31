import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/sequelize';
import {
  AdminAuthModel,
  AdminModel,
  UserAuthModel,
  UserModel,
} from 'src/models';

interface JwtPayload {
  userId?: number;
  adminId?: number;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(AdminModel)
    private adminModel: typeof AdminModel,
  ) {
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
      return await this.userModel.findByPk(userId, {
        include: [UserAuthModel],
      });
    } else if (adminId) {
      return await this.adminModel.findByPk(adminId, {
        include: [AdminAuthModel],
      });
    }
  }
}
