-- AlterTable
ALTER TABLE "UsersAnswers" ADD COLUMN     "submissionId" INTEGER;

-- CreateTable
CREATE TABLE "TestSubmission" (
    "TestSubmissionId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "testId" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestSubmission_pkey" PRIMARY KEY ("TestSubmissionId")
);

-- AddForeignKey
ALTER TABLE "UsersAnswers" ADD CONSTRAINT "UsersAnswers_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "TestSubmission"("TestSubmissionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmission" ADD CONSTRAINT "TestSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSubmission" ADD CONSTRAINT "TestSubmission_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Tests"("TestId") ON DELETE CASCADE ON UPDATE CASCADE;
