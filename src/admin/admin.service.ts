import { ForbiddenException, Get, Injectable } from '@nestjs/common';
import { AdminAuthDto, AdminSigninDto } from './dto';
import * as argon from 'argon2';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaSrcService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async adminSignup(dto: AdminAuthDto) {
    const { displayName, loginName, email, password } = dto;
    try {
      // Generate hash password
      const hash = await argon.hash(password);

      // Create new User
      const newAdmin = await this.prisma.admin.create({
        data: {
          displayName,
          loginName,
          email,
          AdminAuth: {
            create: {
              loginName,
              hash,
              email,
            },
          },
        },
        include: {
          AdminAuth: true,
        },
      });

      return newAdmin;
    } catch (err) {
      console.log(err);

      if (err.code === 'P2002') {
        throw new ForbiddenException('Email already exist');
      }

      throw err;
    }
  }

  async adminSignin(dto: AdminSigninDto, res: Response) {
    const { email, password } = dto;
    try {
      const findAdmin = await this.prisma.admin.findUnique({
        where: { email },
        include: { AdminAuth: true },
      });

      if (!findAdmin) {
        return new ForbiddenException('Cannot find Admin');
      }

      //Compare hash password
      const passwordMatch = await argon.verify(
        findAdmin.AdminAuth[0].hash,
        password,
      );
      if (!passwordMatch) {
        return new ForbiddenException('Error in email or password');
      }

      res
        .status(200)
        .cookie(
          'token',
          (await this.signAdminToken(findAdmin.adminId, findAdmin.email))
            .access_token,
          {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          },
        );
    } catch (err) {
      console.log(err);

      if (err.code === 'P2002') {
        throw new ForbiddenException('Email already exist');
      }

      throw err;
    }
  }

  async signAdminToken(
    adminId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      adminId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      algorithm: 'HS256',
      expiresIn: '180 days',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }

  async adminlogout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json('logout successfully');
  }
}
