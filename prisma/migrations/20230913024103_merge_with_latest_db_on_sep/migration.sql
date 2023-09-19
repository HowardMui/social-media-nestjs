/*
  Warnings:

  - You are about to drop the column `impression` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `numOfUserLikes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `numOfUserRePost` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postCount` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the `_LikePostTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RePostUserPosts` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_LikePostTable" DROP CONSTRAINT "_LikePostTable_A_fkey";

-- DropForeignKey
ALTER TABLE "_LikePostTable" DROP CONSTRAINT "_LikePostTable_B_fkey";

-- DropForeignKey
ALTER TABLE "_RePostUserPosts" DROP CONSTRAINT "_RePostUserPosts_A_fkey";

-- DropForeignKey
ALTER TABLE "_RePostUserPosts" DROP CONSTRAINT "_RePostUserPosts_B_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "impression",
DROP COLUMN "numOfUserLikes",
DROP COLUMN "numOfUserRePost";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "postCount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "_LikePostTable";

-- DropTable
DROP TABLE "_RePostUserPosts";

-- CreateTable
CREATE TABLE "user_liked_posts" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_liked_posts_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "user_rePost_posts" (
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_rePost_posts_pkey" PRIMARY KEY ("postId","userId")
);

-- AddForeignKey
ALTER TABLE "user_liked_posts" ADD CONSTRAINT "user_liked_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_liked_posts" ADD CONSTRAINT "user_liked_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rePost_posts" ADD CONSTRAINT "user_rePost_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_rePost_posts" ADD CONSTRAINT "user_rePost_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
