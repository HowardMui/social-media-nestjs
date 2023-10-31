import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsEmail,
  Model,
  Table,
} from 'sequelize-typescript';
import { UserModel } from './user.model';

export interface UserAuthModelType {
  userAuthId?: number;
  email: string;
  hash: string;
  provider?: string;
  userId?: number;
}

@Table({ tableName: 'userAuth' })
export class UserAuthModel extends Model<UserAuthModelType> {
  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    type: DataType.INTEGER,
  })
  userAuthId: number;

  @IsEmail
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column(DataType.TEXT)
  hash: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  provider: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  userId: number;

  @BelongsTo(() => UserModel)
  user: UserModel;
}
