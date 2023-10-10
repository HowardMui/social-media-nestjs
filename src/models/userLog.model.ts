import {
  AutoIncrement,
  Column,
  CreatedAt,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';

// export enum UserTypeInLogTable {
//   admin = 'admin',
//   user = 'user',
// }

export interface UserLogModelType extends TimeStamp {
  logId: number;
  userId?: number;
  adminId?: number;
  userType: 'admin' | 'user';
  ipAddress: string;
  device: string;
}

@Table({ tableName: 'userLog' })
export class UserLogModel extends Model<UserLogModelType> {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column
  logId: number;

  @Column
  userId: number;

  @Column
  adminId: number;

  @Column
  userType: 'admin' | 'user';

  @Column
  ipAddress: string;

  @Column
  device: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
