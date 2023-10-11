import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel, UserModelType } from './user.model';
import { PostModel, PostModelType } from './post.model';

export interface RePostModelType extends TimeStamp {
  postId: number;
  post: PostModelType;
  userId: number;
  user: UserModelType;
}

@Table({ tableName: 'rePosts' })
export class RePostModel extends Model<RePostModelType> {
  @ForeignKey(() => PostModel)
  @Column(DataType.INTEGER)
  postId: number;

  @BelongsTo(() => PostModel)
  post: PostModel;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
