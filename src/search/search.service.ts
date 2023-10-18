import { Injectable } from '@nestjs/common';
import { PrismaSrcService } from 'src/prisma-src/prisma-src.service';
import { GetSearchQueryParamsWithFilter } from './dto/search.dto';
import { SearchType } from 'src/types';
import { InjectModel } from '@nestjs/sequelize';
import { TagModel, UserModel } from 'src/models';
import { Op } from 'sequelize';

@Injectable()
export class SearchService {
  constructor(
    private prisma: PrismaSrcService,
    @InjectModel(UserModel)
    private userModel: typeof UserModel,
    @InjectModel(TagModel)
    private tagModel: typeof TagModel,
  ) {}

  async searchFn(query: GetSearchQueryParamsWithFilter) {
    try {
      const { limit, offset, keyword, type } = query;

      switch (type) {
        case SearchType.用戶:
        default:
          const { count, rows } = await this.userModel.findAndCountAll({
            where: {
              userName: {
                [Op.substring]: keyword,
              },
            },
            // Sequelize.literal(
            // `MATCH (userName) AGAINST (:name IN BOOLEAN MODE) or userName like :name`,
            //   `userName like :name`,
            // ),
            limit: limit ?? 20,
            offset: offset ?? 0,
            replacements: {
              name: `%${keyword}%`,
            },
          });
          return {
            count,
            rows,
            limit: limit ?? 20,
            offset: offset ?? 0,
          };
        // case SearchType.latest:
        // const postResult = await this.postModel.findAndCountAll({
        //   distinct: true,
        //   where: {
        //     content: {
        //       [Op.substring]: keyword,
        //     },
        //   },
        //   limit: limit ?? 20,
        //   offset: offset ?? 0,
        //   attributes: {
        //     include: [
        //       [
        //         Sequelize.literal(
        //           `(SELECT COUNT(*) FROM user_bookmarkPost AS bp WHERE bp.postId = PostModel.postId)`,
        //         ),
        //         'bookmarkedCount',
        //       ],
        //       [
        //         Sequelize.literal(
        //           `(SELECT COUNT(*) FROM user_rePost AS rp WHERE rp.postId = PostModel.postId)`,
        //         ),
        //         'rePostedCount',
        //       ],
        //       [
        //         Sequelize.literal(
        //           `(SELECT COUNT(*) FROM user_likePost AS lp WHERE lp.postId = PostModel.postId)`,
        //         ),
        //         'likedCount',
        //       ],
        //       [
        //         Sequelize.literal(
        //           `(COALESCE(
        //             (SELECT
        //             JSON_ARRAYAGG(t.tagName)
        //             FROM tag AS t INNER JOIN post_tag AS pt ON t.tagId = pt.tagId WHERE pt.postId = PostModel.postId),
        //             CAST('[]' AS JSON))
        //             )`,
        //         ),
        //         'tags',
        //       ],
        //     ],
        //   },
        //   include: [
        //     {
        //       model: TagModel,
        //       attributes: [],
        //     },
        //     {
        //       model: UserModel,
        //       as: 'bookmarkedPostByUser',
        //       attributes: [],
        //     },
        //     {
        //       model: UserModel,
        //       as: 'likedPostByUser',
        //       attributes: [],
        //     },
        //     {
        //       model: UserModel,
        //       as: 'rePostedByUser',
        //       attributes: [],
        //     },
        //     {
        //       model: UserModel,
        //       as: 'user',
        //     },
        //   ],
        // });
        // return {
        //   count: postResult.count,
        //   rows: postResult.rows,
        //   limit: limit ?? 20,
        //   offset: offset ?? 0,
        // };

        case SearchType.標籤:
          const tagResult = await this.tagModel.findAndCountAll({
            where: {
              tagName: {
                [Op.startsWith]: keyword,
              },
            },
          });
          return {
            count: tagResult.count,
            rows: tagResult.rows,
            limit: limit ?? 20,
            offset: offset ?? 0,
          };
      }
    } catch (err) {
      console.log(err);
    }
  }
}
