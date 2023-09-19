-- CreateEnum
CREATE TYPE "user_type" AS ENUM ('admin', 'user');

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAuth" DROP CONSTRAINT "UserAuth_userId_fkey";

-- CreateTable
CREATE TABLE "Admin" (
    "adminId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "loginName" TEXT NOT NULL,
    "avatar" TEXT,
    "notificationToken" TEXT,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "AdminAuth" (
    "adminAuthId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "loginName" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "uid" INTEGER,
    "provider" TEXT,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuth_pkey" PRIMARY KEY ("adminAuthId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_displayName_key" ON "Admin"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_loginName_key" ON "Admin"("loginName");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAuth_email_key" ON "AdminAuth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminAuth_adminId_key" ON "AdminAuth"("adminId");

-- AddForeignKey
ALTER TABLE "UserAuth" ADD CONSTRAINT "UserAuth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuth" ADD CONSTRAINT "AdminAuth_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("adminId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
