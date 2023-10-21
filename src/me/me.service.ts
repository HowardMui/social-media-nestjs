import { ForbiddenException, HttpStatus, Injectable } from '@nestjs/common';
import {
  GetMeLikedQueryParams,
  GetMePostQueryParams,
  GetMeBookmarkedQueryParams,
  UserSignInDTO,
  UserSignUpDTO,
} from './dto';
import { Request, Response } from 'express';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UpdateMeProfileDTO } from './dto/me-update-profile.dto';
import {
  formatResponseListData,
  formatDevice,
  formatListResponseObject,
} from 'src/helper';
import { RedisService } from 'src/redis/redis.service';
import { InjectModel } from '@nestjs/sequelize';
import { UserFollowModel, UserModel } from 'src/models';
import { UserAuthModel } from 'src/models/userAuth.model';
import { Sequelize } from 'sequelize-typescript';
import { errorHandler } from 'src/error-handler';
import { UserLogModel } from 'src/models/userLog.model';
import {
  findMeFollowingPostAndRePost,
  findMeFollowingPostAndRePostCount,
  userPostAndRePost,
  userPostAndRePostCount,
} from 'src/rawSQLquery';

@Injectable()
export class MeService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(UserLogModel)
    private userLogModel: typeof UserLogModel,
    private sequelize: Sequelize,
  ) {}

  // * Auth ------------------------------------------------------------------------------------

  async userSignIn(
    dto: UserSignInDTO,
    res: Response,
    signInIpAddress: string,
    req: Request,
  ) {
    const { email, password } = dto;
    const { client, device, os } = formatDevice(req);
    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        // * 1. Find user
        const user = await this.userModel.findOne({
          where: {
            email,
          },
          include: [UserAuthModel],
        });

        if (!user) {
          throw new ForbiddenException('Cannot find user');
        } else if (!user.UserAuths.length) {
          throw new ForbiddenException('Invalid user.  Please find Admin');
        }

        // * 2. Compare hash password
        const passwordMatch = await argon.verify(
          user.UserAuths[0].hash,
          password,
        );
        if (!passwordMatch) {
          throw new ForbiddenException('Error in email or password');
        }

        // * 3. Add record to log table
        await this.userLogModel.create(
          {
            userId: user.userId,
            userType: 'user',
            ipAddress: signInIpAddress,
            device: `${device.type}-${device.brand}-${os.name}-${os.version}-${client.type}-${client.name}-${client.version}`,
          },
          transactionHost,
        );

        res
          .status(200)
          .cookie(
            'token',
            (await this.userSignToken(user.userId, user.email)).access_token,
            {
              httpOnly: true,
              sameSite: 'none',
              secure: true,
            },
          );
      });
      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async userSignUp(dto: UserSignUpDTO) {
    const { email, password, userName } = dto;

    try {
      // * Generate hash password
      const hash = await argon.hash(password);

      // * Create new User with sequelize
      const newUser = await this.userModel.create(
        {
          email,
          userName,
          UserAuths: [
            {
              hash,
              email,
            },
          ],
        },
        { include: [UserAuthModel] },
      );

      return newUser;
    } catch (err: Error | any) {
      console.log(err);
      return errorHandler(err);
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

  // * User Action ------------------------------------------------------------------------------------

  async getCurrentUserProfile(currentUserId: number) {
    try {
      // * gmpf = get me profile
      // const cacheMeProfile =
      //   await this.redis.getRedisValue<GetMeFollowersResponse>(`gmpf`);
      // if (cacheMeProfile) {
      //   return cacheMeProfile;
      // } else {
      const currentUser = await this.userModel.findByPk(currentUserId, {
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_follows AS uf WHERE uf.followerId = UserModel.userId)`,
              ),
              'followingCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_follows AS uf WHERE uf.followingId = UserModel.userId)`,
              ),
              'followerCount',
            ],
          ],
        },
        include: [
          {
            model: UserFollowModel,
            as: 'following',
            attributes: [],
          },
          {
            model: UserFollowModel,
            as: 'followers',
            attributes: [],
          },
        ],
      });
      // await this.redis.setRedisValue(`gmpf`, currentUser);
      return currentUser;
      // }
    } catch (err) {
      console.log(err);
    }
  }

  async updateMe(userId: number, dto: UpdateMeProfileDTO) {
    try {
      await this.userModel.update(
        {
          ...dto,
        },
        {
          where: {
            userId,
          },
        },
      );

      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
    }
  }

  // * Find all current user post ------------------------------------------------------------------------------------

  async getAllMePost(query: GetMePostQueryParams, userId: number) {
    const { limit, offset } = query;

    try {
      // * gamp = get all my posts
      // const cachedAllMePostData = await this.redis.getRedisValue<
      //   ListResponse<PostResponse>
      // >(`gamp${formatDataToRedis<GetMePostQueryParams>(query, userId)}`);
      // if (cachedAllMePostData) {
      //   return cachedAllMePostData;
      // } else {

      //       { '$rePostedByUser.userId$': userId }, // Find posts re-posted by the current user

      // await this.redis.setRedisValue(
      //   `gamp${formatDataToRedis<GetMePostQueryParams>(query, userId)}`,
      //   response,
      // );
      // return response;

      // TODO raw sequelize SQL
      const response = await this.sequelize.query(
        userPostAndRePost({ userId, limit, offset }),
        {
          nest: true,
        },
      );

      const count = await this.sequelize.query(userPostAndRePostCount(userId), {
        plain: true,
      });

      return {
        count: count.count,
        rows: response,
        limit: limit ?? 20,
        offset: offset ?? 0,
      };

      // }
    } catch (err) {
      console.log(err);
    }
  }

  async getAllMeFollowingPostList(query: GetMePostQueryParams, userId: number) {
    const { limit, offset } = query;

    // ! Prisma currently not support the m-n relationship ordered by, need a fix in future
    try {
      // const findFollowingPost = await this.postModel.findAndCountAll({
      // where: {
      //   [Op.or]: [
      //     { '$users.userId$': userId }, // Find posts re-posted by the current user
      //   ],
      // },
      //   include: [
      //     {
      //       model: UserModel,
      //       as: 'user',
      //       include: [
      //         {
      //           model: UserFollowModel,
      //           as: 'followers',
      //           where: {
      //             followerId: userId,
      //           },
      //           // attributes: [],
      //         },
      //       ],
      //     },
      //   ],
      // });

      // const findFollowingPost = await this.postModel.findAndCountAll({
      //   where: {
      //     [Op.or]: [
      //       { '$user.followers.followerId$': userId },
      //       // { '$rePost.rePostId$': 'PostModel.postId' },
      //       { '$rePost.user.followers.followerId$': userId },
      //     ],
      //   },
      //   include: [
      //     {
      //       model: UserModel,
      //       as: 'user',
      //       attributes: [],
      //       include: [
      //         {
      //           model: UserFollowModel,
      //           as: 'followers',
      //           where: {
      //             followerId: userId,
      //           },
      //           attributes: [],
      //         },
      //       ],
      //     },
      //     {
      //       model: RePostModel,
      //       as: 'rePost',
      //       attributes: [],
      //       include: [
      //         {
      //           model: UserModel,
      //           as: 'user',
      //           attributes: [],
      //           include: [
      //             {
      //               model: UserFollowModel,
      //               as: 'followers',
      //               where: {
      //                 followerId: userId,
      //               },
      //               attributes: [],
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      // order: [
      //   [Sequelize.literal('`rePost`.`createdAt`'), 'DESC'], // Order by createdAt from RePostModel
      //   [Sequelize.literal('`PostModel`.`createdAt`'), 'DESC'], // Order by createdAt from PostModel
      // ],
      // });

      // TODO raw sequelize SQL

      const response = await this.sequelize.query(
        findMeFollowingPostAndRePost({ userId, limit, offset }),
        {
          nest: true,
        },
      );

      const postCount = await this.sequelize.query(
        findMeFollowingPostAndRePostCount(userId),
        {
          plain: true,
        },
      );

      return {
        count: postCount.count,
        rows: response,
        limit: limit ?? 20,
        offset: offset ?? 0,
      };
    } catch (err) {
      console.log(err);
    }
  }
}
