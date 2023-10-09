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
import { UserModule } from 'src/user/user.module';
import { UserModel } from './user.model';
import { Optional } from 'sequelize';

export interface UserAuthModelType {
  userAuthId?: number;
  email: string;
  hash: string;
  provider?: string;
  userId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  deletedAt?: Date | string;
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
  user: UserModule;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
