import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel, UserModelType } from './user.model';
import { PostModel, PostModelType } from './post.model';

export interface LikePostModelType extends TimeStamp {
  postId: number;
  post: PostModelType;
  userId: number;
  user: UserModelType;
}

@Table({ tableName: 'likePost' })
export class LikePostModel extends Model<LikePostModelType> {
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
