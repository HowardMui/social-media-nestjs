import {
  AutoIncrement,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  HasMany,
  Index,
  IsEmail,
  Length,
  Model,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserAuthModel, UserAuthModelType } from './userAuth.model';
import { TimeStamp } from 'src/types';

export interface UserModelType extends TimeStamp {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  image: string;
  bio: string;
  description: string;
  UserAuths: UserAuthModelType[];
}

@Table({ tableName: 'users' })
export class UserModel extends Model<UserModelType> {
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: true,
  })
  userId: number;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @IsEmail
  @Index({ unique: true, name: 'email_Unique' })
  @Unique({ name: 'email', msg: 'Email already exist' })
  @Column({
    type: DataType.STRING,
  })
  email: string;

  @Index({ unique: true, name: 'userName_Unique' })
  @Unique({ name: 'email', msg: 'UserName already exist' })
  @Length({ max: 20, min: 4 })
  @Column
  userName: string;

  @Column
  image: string;

  @Column
  bio: string;

  @Column
  description: string;

  @HasMany(() => UserAuthModel)
  UserAuths: UserAuthModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
