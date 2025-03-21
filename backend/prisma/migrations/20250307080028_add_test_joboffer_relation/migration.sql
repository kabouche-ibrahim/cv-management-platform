/*
  Warnings:

  - Added the required column `jobOfferId` to the `Tests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tests" ADD COLUMN     "jobOfferId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Tests" ADD CONSTRAINT "Tests_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("JobOfferId") ON DELETE CASCADE ON UPDATE CASCADE;
