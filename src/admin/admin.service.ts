import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AdminSignInDTO, AdminSignUpDTO } from './dto';
import { formatDevice } from 'src/helper';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaSrcService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async adminSignup(dto: AdminSignUpDTO) {
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

  async adminSignIn(
    dto: AdminSignInDTO,
    res: Response,
    signInIpAddress: string,
    req: Request,
  ) {
    const { email, password } = dto;
    const { client, device, os } = formatDevice(req);
    try {
      await this.prisma.$transaction(async (tx) => {
        // * 1. Find admin
        const findAdmin = await tx.admin.findUnique({
          where: { email },
          include: { AdminAuth: true },
        });

        if (!findAdmin) {
          return new ForbiddenException('Cannot find Admin');
        }

        // * 2. Compare hash password
        if (findAdmin.AdminAuth.length > 0) {
          const passwordMatch = await argon.verify(
            findAdmin.AdminAuth[0].hash,
            password,
          );
          if (!passwordMatch) {
            return new ForbiddenException('Error in email or password');
          }
        } else {
          return new ForbiddenException(
            'Some issue with this account.  Please contact Admin.',
          );
        }

        // * 3. Add record to log table
        await tx.logTable.create({
          data: {
            adminId: findAdmin.adminId,
            userType: 'admin',
            ipAddress: signInIpAddress,
            device: `${device.type}-${device.brand}-${os.name}-${os.version}-${client.type}-${client.name}-${client.version}`,
          },
        });

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
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2002') {
        return new ForbiddenException('Email already exist');
      }
      return err;
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

  async adminLogout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json('logout successfully');
  }
}
