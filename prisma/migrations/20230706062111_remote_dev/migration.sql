-- AlterTable
ALTER TABLE "User" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserAuth" ALTER COLUMN "provider" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Bookmark" (
    "bookmarkId" SERIAL NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("bookmarkId")
);

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
