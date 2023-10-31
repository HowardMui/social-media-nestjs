import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel } from './user.model';
import { PostModel } from './post.model';

export interface RePostModelType extends TimeStamp {
  postId: number;
  userId: number;
}

@Table({ tableName: 'user_rePost' })
export class RePostModel extends Model<RePostModelType> {
  @ForeignKey(() => PostModel)
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  postId: number;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;
}
