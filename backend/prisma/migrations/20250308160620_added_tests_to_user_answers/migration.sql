/*
  Warnings:

  - Added the required column `testId` to the `UsersAnswers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsersAnswers" ADD COLUMN     "testId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UsersAnswers" ADD CONSTRAINT "UsersAnswers_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Tests"("TestId") ON DELETE CASCADE ON UPDATE CASCADE;
