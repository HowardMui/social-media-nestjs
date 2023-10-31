import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AdminSignInDTO, AdminSignUpDTO } from './dto';
import { formatDevice } from 'src/helper';
import { InjectModel } from '@nestjs/sequelize';
import { AdminAuthModel, AdminModel, UserLogModel } from 'src/models';
import { errorHandler } from 'src/error-handler';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AdminService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    @InjectModel(AdminModel)
    private adminModel: typeof AdminModel,
    @InjectModel(UserLogModel)
    private userLogModel: typeof UserLogModel,
    private sequelize: Sequelize,
  ) {}

  async adminSignup(dto: AdminSignUpDTO) {
    const { displayName, email, password } = dto;
    try {
      // * Generate hash password
      const hash = await argon.hash(password);

      // * Create new admin

      return await this.adminModel.create(
        {
          email,
          displayName,
          AdminAuth: [
            {
              authEmail: email,
              hash,
            },
          ],
        },
        {
          include: [AdminAuthModel],
        },
      );
    } catch (err) {
      console.log(err);
      return errorHandler(err);
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
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        // * 1. Find admin
        const admin = await this.adminModel.findOne({
          where: {
            email,
          },
          include: [AdminAuthModel],
        });

        if (!admin) {
          throw new ForbiddenException('Cannot find admin');
        } else if (!admin.AdminAuth.length) {
          throw new ForbiddenException(
            'Invalid admin.  Please find super Admin',
          );
        }

        // * 2. Compare hash password
        const passwordMatch = await argon.verify(
          admin.AdminAuth[0].hash,
          password,
        );
        if (!passwordMatch) {
          throw new ForbiddenException('Error in email or password');
        }

        // * 3. Add record to log table
        await this.userLogModel.create(
          {
            adminId: admin.adminId,
            userType: 'admin',
            ipAddress: signInIpAddress,
            device: `${device.type}-${device.brand}-${os.name}-${os.version}-${client.type}-${client.name}-${client.version}`,
          },
          transactionHost,
        );

        res
          .status(200)
          .cookie(
            'token',
            (await this.signAdminToken(admin.adminId, email)).access_token,
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
      if (err.response) {
        return err.response;
      }
      return errorHandler(err);
    }
  }

  // ! Havn't used
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
