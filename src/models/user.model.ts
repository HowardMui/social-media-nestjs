import {
  AutoIncrement,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Index,
  IsEmail,
  Length,
  Model,
  Table,
  Unique,
} from 'sequelize-typescript';
import { UserAuthModel, UserAuthModelType } from './userAuth.model';
import { UserFollowModel } from './userFollow.model';
import { PostModel } from './post.model';
import { RePostModel } from './userPostAndRePost.mode';
import { LikePostModel } from './likePost.model';
import { BookmarkPostModel } from './bookmarkPost.model';
import { CommentModel } from './comment.model';
import { UserLikeCommentModel } from './userLikeComment.model';

export interface UserModelType {
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

@Table({ tableName: 'user' })
export class UserModel extends Model<UserModelType> {
  @AutoIncrement
  @Unique
  @Column({
    primaryKey: true,
    unique: true,
    autoIncrement: true,
    allowNull: false,
  })
  userId: number;

  @Column(DataType.TEXT)
  firstName: string;

  @Column(DataType.TEXT)
  lastName: string;

  @IsEmail
  @Index({ unique: true, name: 'email_Unique' })
  @Unique({ name: 'email', msg: 'Email already exist' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Length({
    max: 20,
    min: 4,
    msg: 'Minimum 4 chars and maximum 20 chars in userName',
  })
  @Index({ unique: true, name: 'userName_unique' })
  @Unique({ name: 'userName', msg: 'UserName already exist' })
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  userName: string;

  @Column(DataType.TEXT)
  image: string;

  @Column(DataType.TEXT)
  bio: string;

  @Column(DataType.TEXT)
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

  @HasMany(() => CommentModel)
  comments: CommentModel[];

  @BelongsToMany(() => CommentModel, {
    through: () => UserLikeCommentModel,
    foreignKey: 'userId',
    otherKey: 'commentId',
    as: 'likedComments',
  })
  likedComments: CommentModel[];
}
