import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { CommentModel } from './comment.model';
import { UserModel } from './user.model';

export interface UserLikeCommentType extends TimeStamp {
  commentId: number;
  userId: number;
}

@Table({ tableName: 'user_likeComment' })
export class UserLikeCommentModel extends Model<UserLikeCommentType> {
  @ForeignKey(() => CommentModel)
  @Column({ type: DataType.INTEGER })
  commentId: number;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.INTEGER })
  userId: number;
}
