import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Length,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel, UserModelType } from './user.model';
import { RePostModel } from './userPostAndRePost.mode';
import { LikePostModel } from './likePost.model';
import { BookmarkPostModel } from './bookmarkPost.model';
import { TagModel } from './tag.model';
import { PostTagModel } from './postTag.model';
import { CommentModel } from './comment.model';

export interface PostModelType extends TimeStamp {
  postId: number;
  images: string[];
  content: string;
  userId: number;
  user: UserModelType;
  tags: TagModel[];
}

@Table({ tableName: 'post' })
export class PostModel extends Model<PostModelType> {
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: true,
    type: DataType.INTEGER,
  })
  postId: number;

  @Column(DataType.JSON)
  images: string[];

  @Length({
    max: 2000,
    msg: 'Minimum 2000 character in content',
  })
  @Column(DataType.TEXT)
  content: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsToMany(() => UserModel, {
    through: () => RePostModel,
    foreignKey: 'postId',
    otherKey: 'userId',
    as: 'rePostedByUser',
  })
  rePostedByUser: UserModel[];

  @BelongsToMany(() => UserModel, {
    through: () => LikePostModel,
    foreignKey: 'postId',
    otherKey: 'userId',
    as: 'likedPostByUser',
  })
  likedPostByUser: UserModel[];

  @BelongsToMany(() => UserModel, {
    through: () => BookmarkPostModel,
    foreignKey: 'postId',
    otherKey: 'userId',
    as: 'bookmarkedPostByUser',
  })
  bookmarkedPostByUser: UserModel[];

  @BelongsToMany(() => TagModel, () => PostTagModel)
  postTags: TagModel[];

  @HasMany(() => CommentModel)
  userComments: CommentModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
