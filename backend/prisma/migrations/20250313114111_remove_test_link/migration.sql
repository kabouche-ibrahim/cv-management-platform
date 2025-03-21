/*
  Warnings:

  - You are about to drop the column `testLink` on the `Tests` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tests_testLink_key";

-- AlterTable
ALTER TABLE "Tests" DROP COLUMN "testLink";
