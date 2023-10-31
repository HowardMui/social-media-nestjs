import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Length,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel, UserModelType } from './user.model';
import { PostModel } from './post.model';
import { UserLikeCommentModel } from './userLikeComment.model';

export interface CommentModelType extends TimeStamp {
  commentId: number;
  message: string;
  user: UserModelType;
  userId: number;
  post: PostModel;
  postId: number;
  parentCommentId: number | null;
  parentComment: CommentModelType;
}

@Table({ tableName: 'comment' })
export class CommentModel extends Model<CommentModelType> {
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
    type: DataType.INTEGER,
  })
  commentId: number;

  @Column(DataType.TEXT)
  message: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @ForeignKey(() => PostModel)
  @Column(DataType.INTEGER)
  postId: number;

  @BelongsTo(() => PostModel)
  post: PostModel;

  @ForeignKey(() => CommentModel)
  @Column(DataType.INTEGER)
  parentCommentId: number;

  @BelongsTo(() => CommentModel, { foreignKey: 'parentCommentId' })
  parentComment: CommentModel;

  @HasMany(() => CommentModel)
  comments: CommentModel[];

  @BelongsToMany(() => UserModel, {
    through: () => UserLikeCommentModel,
    foreignKey: 'commentId',
    otherKey: 'userId',
    as: 'likedByUser',
  })
  likedByUser: UserModel[];
}
