import {
  BadRequestException,
  ConsoleLogger,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import {
  CreatePostDTO,
  GetPostQueryParamsWithFilter,
  PostResponse,
} from './dto';
import {
  orderByFilter,
  returnAscOrDescInQueryParamsWithFilter,
} from 'src/helper';
import { Tag } from '@prisma/client';
import { ListResponse } from 'src/types';
import { RedisService } from 'src/redis/redis.service';
import { formatDataToRedis } from 'src/helper/format-data-to-redis';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import {
  LikePostModel,
  PostModel,
  PostTagModel,
  TagModel,
  UserModel,
} from 'src/models';
import { includes } from 'lodash';
import { Op } from 'sequelize';
import { errorHandler } from 'src/error-handler';
import { BookmarkPostModel } from 'src/models/bookmarkPost.model';
import { RePostModel } from 'src/models/userPostAndRePost.mode';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaSrcService,
    private redis: RedisService,
    @InjectModel(PostModel)
    private postModel: typeof PostModel,
    @InjectModel(TagModel)
    private tagModel: typeof TagModel,
    @InjectModel(PostTagModel)
    private postTagModel: typeof PostTagModel,
    private sequelize: Sequelize,
  ) {}
  private readonly logger = new Logger(PostService.name);

  // * Basic CRUD ------------------------------------------------------------------------------------

  async getAllPostLists(query: GetPostQueryParamsWithFilter) {
    const { limit, offset, asc, desc, userName } = query;
    try {
      // * check if data is in cache:
      // const cachedData = await this.redis.getRedisValue<
      //   ListResponse<PostResponse>
      // >(`gap${formatDataToRedis<GetPostQueryParamsWithFilter>(query)}`);
      // if (cachedData) {
      //   return cachedData;
      // } else {
      //   await this.redis.setRedisValue(
      //     `gap${formatDataToRedis<GetPostQueryParamsWithFilter>(query)}`,
      //     returnObject,
      //   );
      // }

      // ! Sequelize test format the tagName sql

      //     [
      //       Sequelize.literal(
      //         `(SELECT JSON_ARRAY(JSON_EXTRACT(GROUP_CONCAT(JSON_OBJECT('tagName', Tag.tagName)), '$[*].tagName')) FROM tag AS Tag INNER JOIN post_tag AS pt ON Tag.tagId = pt.tagId WHERE pt.postId = PostModel.postId)`,
      //       ),
      //       'tagName',
      //     ],
      const { count, rows } = await this.postModel.findAndCountAll({
        distinct: true,
        order: orderByFilter(asc, desc) ?? [['postId', 'DESC']],
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_bookmarkPost AS bp WHERE bp.postId = PostModel.postId)`,
              ),
              'bookmarkedCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_rePost AS rp WHERE rp.postId = PostModel.postId)`,
              ),
              'rePostedCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_likePost AS lp WHERE lp.postId = PostModel.postId)`,
              ),
              'likedCount',
            ],
          ],
        },
        include: [
          {
            model: TagModel,
            attributes: ['tagId', 'tagName'],
            through: { attributes: [] },
          },
          {
            model: UserModel,
            as: 'bookmarkedPostByUser',
            attributes: [],
          },
          {
            model: UserModel,
            as: 'likedPostByUser',
            attributes: [],
          },
          {
            model: UserModel,
            as: 'rePostedByUser',
            attributes: [],
          },
          {
            model: UserModel,
            as: 'user',
          },
        ],
        // group: ['PostModel.postId', 'tags.tagId'],
      });

      return {
        count: count,
        rows,
        limit: limit ?? 0,
        offset: offset ?? 20,
      };

      // return {
      //   count,
      //   rows: rows.map((el) => {
      //     const { tags, ...rest } = el.toJSON();
      //     return {
      //       ...rest,
      //       tags: tags.map((tag) => tag.tagName),
      //     };
      //   }),
      //   // rows,
      //   limit: limit ?? 0,
      //   offset: offset ?? 20,
      // };
    } catch (err) {
      console.log(err);
      if (err.message.includes('Unknown arg')) {
        throw new BadRequestException(
          `Invalid orderBy field: ${
            err.message.split('Unknown arg')[1].split(' in ')[0]
          }}`,
        );
      }
    }
  }

  async getOnePost(postId: number) {
    try {
      //TODO Test get all post tag with SQL
      // const fineOnePost = await this.prisma.$queryRaw`
      // SELECT "Post".*, JSON_AGG(DISTINCT jsonb_build_object('tagId',"Tag"."tagId", 'tagName',"Tag"."tagName")) AS "tags"
      //   FROM "Post"
      //   LEFT OUTER JOIN "_PostTags" ON "Post"."postId" = "_PostTags"."A"
      //   LEFT OUTER JOIN "Tag" ON "_PostTags"."B" = "Tag"."tagId"
      //   WHERE "Post"."postId" = ${postId}
      //   GROUP BY "Post"."postId"
      //   `;
      // return fineOnePost;

      const post = await this.postModel.findByPk(postId, {
        attributes: {
          include: [
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_bookmarkPost AS bp WHERE bp.postId = PostModel.postId)`,
              ),
              'bookmarkedCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_rePost AS rp WHERE rp.postId = PostModel.postId)`,
              ),
              'rePostedCount',
            ],
            [
              Sequelize.literal(
                `(SELECT COUNT(*) FROM user_likePost AS lp WHERE lp.postId = PostModel.postId)`,
              ),
              'likedCount',
            ],
          ],
        },
        include: [
          {
            model: TagModel,
            attributes: ['tagId', 'tagName'],
            through: { attributes: [] },
          },
          {
            model: UserModel,
            as: 'bookmarkedPostByUser',
            attributes: [],
          },
          {
            model: UserModel,
            as: 'likedPostByUser',
            attributes: [],
          },
          {
            model: UserModel,
            as: 'rePostedByUser',
            attributes: [],
          },
          {
            model: UserModel,
            as: 'user',
          },
        ],
        // group: ['tags.tagId'],
      });
      // .then((posts) => {
      //   return posts.toJSON().map(({tags, ...rest}) => {
      //     return {
      //       ...rest,
      //       tags: tags.flatMap((tag) => tag),
      //     };
      //   })
      // });

      if (!post) {
        return new NotFoundException('Post do not exist');
      }

      return post;
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async createOnePost(body: CreatePostDTO, userId: number) {
    const { tagName, ...postBody } = body;

    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };
        const postTags = await Promise.all(
          tagName.map((tagName) =>
            TagModel.findOrCreate({ where: { tagName }, ...transactionHost }),
          ),
        );

        const createdPost = await this.postModel.create(
          {
            ...postBody,
            userId,
          },
          transactionHost,
        );

        await this.postTagModel.bulkCreate(
          postTags.map((tag) => {
            return {
              postId: createdPost.postId,
              tagId: tag[0].tagId,
            };
          }),
          transactionHost,
        );
      });

      return HttpStatus.CREATED;
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async deleteOnePost(postId: number) {
    try {
      await this.postModel.destroy({
        where: {
          postId,
        },
      });

      return { status: HttpStatus.OK };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
