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
import { ListResponse } from 'src/types';
import { RedisService } from 'src/redis/redis.service';
import { formatDataToRedis } from 'src/helper/format-data-to-redis';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import {
  LikePostModel,
  PostModel,
  PostModelType,
  PostTagModel,
  TagModel,
  UserModel,
} from 'src/models';
import { errorHandler } from 'src/error-handler';
import { Op, WhereOptions } from 'sequelize';

@Injectable()
export class PostService {
  constructor(
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
    const { limit, offset, asc, desc, content, tagName } = query;
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

      const postContentCondition: {
        content?: { [x: symbol]: string };
      } = {};

      const tagNameCondition: {
        tagName?: { [x: symbol]: string };
      } = {};

      if (content) {
        postContentCondition.content = { [Op.substring]: content };
      }

      if (tagName) {
        tagNameCondition.tagName = { [Op.substring]: tagName };
      }

      const { count, rows } = await this.postModel.findAndCountAll({
        distinct: true,
        limit: limit ?? 20,
        offset: offset ?? 0,
        order: orderByFilter(asc, desc) ?? [['postId', 'DESC']],
        where: postContentCondition,
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
            [
              Sequelize.literal(
                `(COALESCE(
                  (SELECT 
                  JSON_ARRAYAGG(t.tagName)
                  FROM tag AS t INNER JOIN post_tag AS pt ON t.tagId = pt.tagId WHERE pt.postId = PostModel.postId),
                  CAST('[]' AS JSON))
                  )`,
              ),
              'tags',
            ],
          ],
        },
        include: [
          {
            model: TagModel,
            where: tagNameCondition,
            attributes: [],
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
            [
              Sequelize.literal(
                `(COALESCE(
                  (SELECT 
                  JSON_ARRAYAGG(t.tagName)
                  FROM tag AS t INNER JOIN post_tag AS pt ON t.tagId = pt.tagId WHERE pt.postId = PostModel.postId),
                  CAST('[]' AS JSON))
                  )`,
              ),
              'tags',
            ],
          ],
        },
        include: [
          {
            model: TagModel,
            attributes: [],
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
      });

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
