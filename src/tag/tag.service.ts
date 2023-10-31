import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateOneTagDTO,
  GetAllTagQueryParamsWithFilter,
  UpdateOneTagDTO,
} from './dto';
import { InjectModel } from '@nestjs/sequelize';
import { PostTagModel, TagModel } from 'src/models';
import { errorHandler } from 'src/error-handler';
import { Sequelize } from 'sequelize-typescript';
import { countPostWithTagName, getOneTagName } from 'src/rawSQLquery';
import { Op } from 'sequelize';

@Injectable()
export class TagService {
  constructor(
    @InjectModel(TagModel)
    private tagModel: typeof TagModel,
    @InjectModel(PostTagModel)
    private postTagModel: typeof PostTagModel,
    private sequelize: Sequelize,
  ) {}

  async getAllTagList(query: GetAllTagQueryParamsWithFilter) {
    const { limit, offset, tagName } = query;

    const tagNameFilter: {
      tagName?: { [x: symbol]: string };
    } = {};

    if (tagName) {
      tagNameFilter.tagName = { [Op.startsWith]: tagName };
    }

    try {
      const { count, rows } = await this.tagModel.findAndCountAll({
        where: tagNameFilter,
        limit: limit ?? 20,
        offset: offset ?? 0,
      });

      return {
        count,
        rows,
        limit,
        offset,
      };
    } catch (err) {
      console.log(err);
    }
  }

  // * May be remove (Don't know usage)
  async getPostListInOneTag(query, tagName: string) {
    const { limit, offset } = query;
    try {
      const findTag = await this.tagModel.findOne({
        where: {
          tagName,
        },
      });

      if (!findTag) {
        return new NotFoundException('Tag does not exist');
      }

      const postCount = await this.sequelize.query(
        countPostWithTagName(tagName),
        {
          plain: true,
        },
      );

      const rows = await this.sequelize.query(
        getOneTagName({
          limit,
          offset,
          tagName,
        }),
        {
          nest: true,
        },
      );

      return {
        count: postCount.count,
        rows,
        limit,
        offset,
      };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async createOneTag(body: CreateOneTagDTO) {
    const { postId, tagName } = body;

    try {
      await this.sequelize.transaction(async (t) => {
        const transactionHost = { transaction: t };

        const createdTag = await this.tagModel.create(
          {
            tagName,
          },
          transactionHost,
        );

        await this.postTagModel.bulkCreate(
          postId.map((id) => {
            return {
              postId: id,
              tagId: createdTag.tagId,
            };
          }),
          transactionHost,
        );
      });

      return { status: HttpStatus.CREATED };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }

  async updateOneTag(tagNameParam: string, body: UpdateOneTagDTO) {
    const { tagName } = body;
    try {
      await this.tagModel.update(
        {
          tagName,
        },
        {
          where: {
            tagName: tagNameParam,
          },
        },
      );
      return { status: HttpStatus.OK, message: 'Updated' };
    } catch (err) {
      console.log(err);
      if (err.code === 'P2025' || err.code === 'P2016') {
        throw new NotFoundException('Tag do not exist');
      }
    }
  }

  async deleteOneTag(tagName: string) {
    try {
      await this.tagModel.destroy({
        where: {
          tagName,
        },
      });

      return { status: HttpStatus.OK, message: 'Deleted' };
    } catch (err) {
      console.log(err);
      return errorHandler(err);
    }
  }
}
