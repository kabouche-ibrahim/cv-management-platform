/*
  Warnings:

  - You are about to drop the `UserCVs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserCVs" DROP CONSTRAINT "UserCVs_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cvName" TEXT,
ADD COLUMN     "cvUrl" TEXT,
ADD COLUMN     "lastUploadDate" TIMESTAMP(3);

-- DropTable
DROP TABLE "UserCVs";
