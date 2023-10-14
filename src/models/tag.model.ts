import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  Index,
  Length,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { PostModel } from './post.model';
import { PostTagModel } from './postTag.model';

export interface TagModelType extends TimeStamp {
  tagId: number;
  tagName: string;
}

@Table({ tableName: 'tag' })
export class TagModel extends Model<TagModelType> {
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: true,
    type: DataType.INTEGER,
  })
  tagId: number;

  @Index({ unique: true, name: 'tagName_Unique' })
  @Unique({ name: 'tagName_Unique', msg: 'tagName already exist' })
  @Length({
    max: 25,
    min: 2,
    msg: 'Minimum 2 chars and maximum 25 chars in tagName',
  })
  @Column
  tagName: string;

  @BelongsToMany(() => PostModel, () => PostTagModel)
  post: PostModel[];
}
