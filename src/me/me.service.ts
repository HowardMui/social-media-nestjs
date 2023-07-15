import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  GetOneUserLikedPost,
  GetUserBookmarkedPost,
  UpdateUserProfileDTO,
  UserProfileAuthDto,
} from './dto';
import { Request, Response } from 'express';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MeService {
  constructor(
    private prisma: PrismaSrcService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Auth ------------------------------------------------------------------------------------

  async userSignIn(dto: UserProfileAuthDto, res: Response) {
    const { email, password } = dto;

    try {
      const findUser = await this.prisma.user.findUnique({
        where: { email },
        include: { UserAuths: true },
      });

      if (!findUser) {
        return new ForbiddenException('Cannot find user');
      }

      //Compare hash password
      const passwordMatch = await argon.verify(
        findUser.UserAuths[0].hash,
        password,
      );
      if (!passwordMatch) {
        return new ForbiddenException('Error in email or password');
      }

      res
        .status(200)
        .cookie(
          'token',
          (await this.userSignToken(findUser.userId, findUser.email))
            .access_token,
          {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
          },
        );
    } catch (err) {
      console.log(err);
    }
  }

  async userSignUp(dto: UserProfileAuthDto) {
    const { email, password } = dto;

    try {
      // Generate hash password
      const hash = await argon.hash(password);

      // Create new User
      const newUser = await this.prisma.user.create({
        data: {
          email,
          UserAuths: {
            create: {
              hash,
              email,
            },
          },
        },
        include: {
          UserAuths: true,
        },
      });

      return newUser;
    } catch (err) {
      console.log(err);

      if (err.code === 'P2002') {
        throw new ForbiddenException('Email already exist');
      }

      throw err;
    }
  }

  async logout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.status(200).json('logout successfully');
  }

  async userSignToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      userId,
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

  // User Action ------------------------------------------------------------------------------------

  async updateMe(req: Request, dto: UpdateUserProfileDTO) {
    try {
      const testUpdate = await this.prisma.user.update({
        where: {
          userId: req.user['userId'],
        },
        data: dto,
      });
      console.log(testUpdate);
      return testUpdate;
    } catch (err) {
      console.log(err);
    }
  }

  // bookmark Action ------------------------------------------------------------------------------------

  async getAllUserBookmarkList(query: GetUserBookmarkedPost, userId: number) {
    const { limit, offset, asc, desc } = query;

    try {
      const findBookmarkPost = await this.prisma.user.findMany({
        where: {
          userId,
        },
        select: {
          bookmarkedPosts: {
            skip: offset ?? 0,
            take: limit ?? 20,
            select: {
              post: true,
            },
          },
        },
      });

      const rows = findBookmarkPost[0].bookmarkedPosts.map((bookmark) => {
        return {
          ...bookmark.post,
        };
      });

      const returnObject = {
        count: rows.length,
        rows,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };
      return returnObject;
    } catch (err) {
      console.log(err);
    }
  }

  // like Action ------------------------------------------------------------------------------------

  async getMeLikedPostList(query: GetOneUserLikedPost, userId: number) {
    const { limit, offset, asc, desc } = query;

    try {
      const findLikedPost = await this.prisma.userLikedPost.findMany({
        where: {
          userId,
        },
        skip: offset ?? 0,
        take: limit ?? 20,
        select: {
          post: true,
        },
      });

      const rows = findLikedPost.map((liked) => {
        return {
          ...liked.post,
        };
      });

      const returnObject = {
        count: rows.length,
        rows,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      return returnObject;
    } catch (err) {
      console.log(err);
    }
  }
}
