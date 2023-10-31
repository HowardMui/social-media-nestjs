import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  Index,
  IsEmail,
  Length,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { AdminAuthModel, AdminAuthModelType } from './adminAuth.model';
import { TimeStamp } from 'src/types';

export interface AdminModelType extends TimeStamp {
  adminId?: number;
  email: string;
  displayName: string;
  avatar: string;
  AdminAuth: AdminAuthModelType[];
}

@Table({ tableName: 'admin' })
export class AdminModel extends Model<AdminModelType> {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: true,
  })
  adminId: number;

  @IsEmail
  @Index({ unique: true, name: 'admin_email_unique' })
  @Unique({ name: 'email', msg: 'Email already exist' })
  @Column
  email: string;

  @Index({ unique: true, name: 'displayName_unique' })
  @Unique({ name: 'displayName', msg: 'DisplayName already exist' })
  @Length({
    max: 20,
    min: 4,
    msg: 'Minimum 4 chars and maximum 20 chars in displayName',
  })
  @Column
  displayName: string;

  @Column(DataType.TEXT)
  avatar: string;

  @HasMany(() => AdminAuthModel)
  AdminAuth: AdminAuthModel[];
}
