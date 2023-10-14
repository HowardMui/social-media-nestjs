import {
  AutoIncrement,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Length,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';

export interface CommentModelType extends TimeStamp {}

@Table({ tableName: 'comment' })
export class CommentModel extends Model<CommentModelType> {
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: true,
    type: DataType.INTEGER,
  })
  commentId: number;

  //   @Length({
  //     max: 25,
  //     min: 2,
  //     msg: 'Minimum 2 chars and maximum 25 chars in tagName',
  //   })
  //   @Column(DataType.TEXT)
  //   tagName: string;

  // @ForeignKey(() => PostModel)
  // @Column(DataType.INTEGER)
  // postId: number;

  // @BelongsToMany(() => PostModel, () => PostTagModel)
  // post: PostModel[];
}
