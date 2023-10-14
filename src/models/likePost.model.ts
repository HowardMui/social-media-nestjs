import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel } from './user.model';
import { PostModel } from './post.model';

export interface LikePostModelType extends TimeStamp {
  postId: number;
  userId: number;
}

@Table({ tableName: 'user_likePost' })
export class LikePostModel extends Model<LikePostModelType> {
  @ForeignKey(() => PostModel)
  @Column(DataType.INTEGER)
  postId: number;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;
}
