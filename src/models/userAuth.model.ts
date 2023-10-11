import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { UserModel } from './user.model';
import { CreationOptional, Optional } from 'sequelize';

export interface UserAuthModelType {
  userAuthId?: number;
  email: string;
  hash: string;
  provider?: string;
  userId?: string;
}

type UserAuthModelOptionalType = Optional<UserAuthModelType, 'userAuthId'>;

@Table({ tableName: 'userAuth' })
export class UserAuthModel extends Model<
  UserAuthModelType,
  UserAuthModelOptionalType
> {
  @PrimaryKey
  @Unique
  @AutoIncrement
  @AllowNull
  @Column
  userAuthId?: number;

  @Column
  email: string;

  @Column
  hash: string;

  @Column({ allowNull: true })
  provider: string;

  @ForeignKey(() => UserModel)
  @Column
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  declare deletedAt: CreationOptional<Date>;
}
