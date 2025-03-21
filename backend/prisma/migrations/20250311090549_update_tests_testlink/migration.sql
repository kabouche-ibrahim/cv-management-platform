/*
  Warnings:

  - A unique constraint covering the columns `[testLink]` on the table `Tests` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tests" ADD COLUMN     "testLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tests_testLink_key" ON "Tests"("testLink");
