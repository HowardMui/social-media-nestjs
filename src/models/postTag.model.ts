import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { PostModel } from './post.model';
import { TagModel } from './tag.model';

export interface PostTagType extends TimeStamp {
  postId: number;
  tagId: number;
}

@Table({ tableName: 'post_tag' })
export class PostTagModel extends Model<PostTagType> {
  @ForeignKey(() => PostModel)
  @Column(DataType.INTEGER)
  postId: number;

  @ForeignKey(() => TagModel)
  @Column(DataType.INTEGER)
  tagId: number;
}
