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

export interface BookmarkPostModelType extends TimeStamp {
  postId: number;
  userId: number;
}

@Table({ tableName: 'user_bookmarkPost' })
export class BookmarkPostModel extends Model<BookmarkPostModelType> {
  @ForeignKey(() => PostModel)
  @Column(DataType.INTEGER)
  postId: number;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;
}
