import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { AdminModel } from './admin.model';

export interface AdminAuthModelType {
  adminAuthId?: number;
  authEmail: string;
  hash: string;
  provider?: string;
  adminId?: number;
}

@Table({ tableName: 'adminAuth' })
export class AdminAuthModel extends Model<AdminAuthModelType> {
  @PrimaryKey
  @AutoIncrement
  @Unique
  @AllowNull
  @Column(DataType.INTEGER)
  adminAuthId?: number;

  @IsEmail
  @Index({ name: 'authEmail_unique', unique: true })
  @Unique({ name: 'authEmail', msg: 'Email already exist' })
  @Column(DataType.STRING)
  authEmail: string;

  @Column(DataType.TEXT)
  hash: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  provider: string;

  @ForeignKey(() => AdminModel)
  @Column
  adminId: number;

  @BelongsTo(() => AdminModel)
  admin: AdminModel;
}
