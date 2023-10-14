import {
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  DeletedAt,
  ForeignKey,
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
import { UserFollowModel } from './userFollow.model';
import { PostModel } from './post.model';
import { RePostModel } from './userPostAndRePost.mode';
import { LikePostModel } from './likePost.model';
import { BookmarkPostModel } from './bookmarkPost.model';

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
  @Length({
    max: 20,
    min: 4,
    msg: 'Minimum 4 chars and maximum 20 chars in userName',
  })
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

  // * JOIN condition : userId = followerId

  @HasMany(() => UserFollowModel, {
    foreignKey: 'followingId',
    as: 'followers',
  })
  followers: UserFollowModel[];

  @HasMany(() => UserFollowModel, {
    foreignKey: 'followerId',
    as: 'following',
  })
  following: UserFollowModel[];

  @HasMany(() => PostModel)
  posts: PostModel[];

  // @HasMany(() => RePostModel)
  // rePost: RePostModel[];

  @BelongsToMany(() => PostModel, {
    through: () => RePostModel,
    foreignKey: 'userId',
    otherKey: 'postId',
    as: 'userRePosts',
  })
  rePost: RePostModel[];

  @BelongsToMany(() => PostModel, {
    through: () => LikePostModel,
    foreignKey: 'userId',
    otherKey: 'postId',
    as: 'likedPosts',
  })
  likedPosts: PostModel[];

  @BelongsToMany(() => PostModel, {
    through: () => BookmarkPostModel,
    foreignKey: 'userId',
    otherKey: 'postId',
    as: 'bookmarkedPosts',
  })
  bookmarkedPosts: PostModel[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @DeletedAt
  deletedAt: Date;
}
