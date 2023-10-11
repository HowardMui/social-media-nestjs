import {
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel, UserModelType } from './user.model';
import { RePostModel } from './userPostAndRePost.mode';

export interface PostModelType extends TimeStamp {
  postId: number;
  image: string;
  content: string;
  userId: number;
  user: UserModelType;
}

@Table({ tableName: 'posts' })
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

  @Column(DataType.TEXT)
  image: string;

  @Column(DataType.TEXT)
  content: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @HasMany(() => RePostModel)
  rePost: RePostModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
