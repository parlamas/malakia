/*
  Warnings:

  - You are about to drop the column `reasoning` on the `ScaleSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `ScaleSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `adminScaleValue` on the `Subject` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JudgmentSide" AS ENUM ('NEGATIVE', 'POSITIVE', 'ZERO');

-- AlterEnum
ALTER TYPE "SubjectType" ADD VALUE 'REGIME';

-- AlterTable
ALTER TABLE "ScaleSuggestion" DROP COLUMN "reasoning",
DROP COLUMN "value";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "adminScaleValue";

-- CreateTable
CREATE TABLE "SuggestionEntry" (
    "id" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "side" "JudgmentSide" NOT NULL,
    "magnitude" INTEGER NOT NULL,
    "justification" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminJudgment" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "setByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminJudgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminJudgmentEntry" (
    "id" TEXT NOT NULL,
    "judgmentId" TEXT NOT NULL,
    "side" "JudgmentSide" NOT NULL,
    "magnitude" INTEGER NOT NULL,
    "justification" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminJudgmentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminJudgment_subjectId_key" ON "AdminJudgment"("subjectId");

-- AddForeignKey
ALTER TABLE "SuggestionEntry" ADD CONSTRAINT "SuggestionEntry_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "ScaleSuggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminJudgment" ADD CONSTRAINT "AdminJudgment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminJudgment" ADD CONSTRAINT "AdminJudgment_setByUserId_fkey" FOREIGN KEY ("setByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminJudgmentEntry" ADD CONSTRAINT "AdminJudgmentEntry_judgmentId_fkey" FOREIGN KEY ("judgmentId") REFERENCES "AdminJudgment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
