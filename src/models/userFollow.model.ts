import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { TimeStamp } from 'src/types';
import { UserModel } from './user.model';

export interface UserFollowModelType extends TimeStamp {
  followerId: number;
  followingId: number;
}

@Table({ tableName: 'userFollows' })
export class UserFollowModel extends Model<UserFollowModelType> {
  @ForeignKey(() => UserModel)
  @Column
  followingId: number;

  @ForeignKey(() => UserModel)
  @Column
  followerId: number;

  @BelongsTo(() => UserModel, { foreignKey: 'followingId', as: 'following' })
  following: UserModel;

  @BelongsTo(() => UserModel, { foreignKey: 'followerId', as: 'followers' })
  follower: UserModel;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
