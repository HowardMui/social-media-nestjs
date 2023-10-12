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

export interface BookmarkPostModelType extends TimeStamp {
  postId: number;
  post: PostModelType;
  userId: number;
  user: UserModelType;
}

@Table({ tableName: 'bookmarkPost' })
export class BookmarkPostModel extends Model<BookmarkPostModelType> {
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
