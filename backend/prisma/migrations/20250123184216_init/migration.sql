-- CreateTable
CREATE TABLE "User" (
    "UserId" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "Skills" (
    "SkillId" SERIAL NOT NULL,
    "skillName" TEXT NOT NULL,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("SkillId")
);

-- CreateTable
CREATE TABLE "UserSkills" (
    "UserSkillId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "UserSkills_pkey" PRIMARY KEY ("UserSkillId")
);

-- CreateTable
CREATE TABLE "JobOffer" (
    "JobOfferId" SERIAL NOT NULL,
    "jobName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "educationNeeded" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOffer_pkey" PRIMARY KEY ("JobOfferId")
);

-- CreateTable
CREATE TABLE "JobOfferSkills" (
    "JobOfferSkillId" SERIAL NOT NULL,
    "jobOfferId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    CONSTRAINT "JobOfferSkills_pkey" PRIMARY KEY ("JobOfferSkillId")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "JobApplicationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "jobOfferId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("JobApplicationId")
);

-- CreateTable
CREATE TABLE "Tests" (
    "TestId" SERIAL NOT NULL,
    "testTitle" TEXT NOT NULL,
    "testDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tests_pkey" PRIMARY KEY ("TestId")
);

-- CreateTable
CREATE TABLE "Questions" (
    "QuestionId" SERIAL NOT NULL,
    "testId" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "defaultGrade" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("QuestionId")
);

-- CreateTable
CREATE TABLE "Answers" (
    "AnswerId" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerValue" TEXT NOT NULL,
    "answerIsCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("AnswerId")
);

-- CreateTable
CREATE TABLE "UsersAnswers" (
    "UsersAnswerId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "answerId" INTEGER NOT NULL,
    "userQuestionId" INTEGER NOT NULL,

    CONSTRAINT "UsersAnswers_pkey" PRIMARY KEY ("UsersAnswerId")
);

-- CreateTable
CREATE TABLE "UserCVs" (
    "UserCVId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "cvUrl" TEXT NOT NULL,
    "cvName" TEXT NOT NULL,
    "lastUploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCVs_pkey" PRIMARY KEY ("UserCVId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "UserSkills" ADD CONSTRAINT "UserSkills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkills" ADD CONSTRAINT "UserSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("SkillId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOfferSkills" ADD CONSTRAINT "JobOfferSkills_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("JobOfferId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOfferSkills" ADD CONSTRAINT "JobOfferSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("SkillId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobOfferId_fkey" FOREIGN KEY ("jobOfferId") REFERENCES "JobOffer"("JobOfferId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Tests"("TestId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Questions"("QuestionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersAnswers" ADD CONSTRAINT "UsersAnswers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersAnswers" ADD CONSTRAINT "UsersAnswers_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answers"("AnswerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCVs" ADD CONSTRAINT "UserCVs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("UserId") ON DELETE RESTRICT ON UPDATE CASCADE;
