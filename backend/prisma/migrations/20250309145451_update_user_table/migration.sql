/*
  Warnings:

  - You are about to drop the column `cvName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "cvName",
ADD COLUMN     "cvId" INTEGER;
