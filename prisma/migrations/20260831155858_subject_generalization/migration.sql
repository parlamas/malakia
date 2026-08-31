/*
  Warnings:

  - You are about to drop the column `subjectPersonId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `personId` on the `ScaleSuggestion` table. All the data in the column will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subjectId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `ScaleSuggestion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('PERSON', 'INSTITUTION', 'ORGANIZATION', 'BUSINESS', 'NATION', 'PRACTICE', 'TRADITION', 'IDEOLOGY');

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_subjectPersonId_fkey";

-- DropForeignKey
ALTER TABLE "ScaleSuggestion" DROP CONSTRAINT "ScaleSuggestion_personId_fkey";

-- DropIndex
DROP INDEX "Post_subjectPersonId_axis_idx";

-- DropIndex
DROP INDEX "ScaleSuggestion_personId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "subjectPersonId",
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScaleSuggestion" DROP COLUMN "personId",
ADD COLUMN     "subjectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Person";

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "subjectType" "SubjectType" NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "disambiguators" TEXT,
    "personaCategory" "PersonaCategory",
    "roleTitle" TEXT,
    "roleStartYear" INTEGER,
    "roleStartMonth" INTEGER,
    "roleStartDay" INTEGER,
    "roleStartCirca" BOOLEAN NOT NULL DEFAULT false,
    "roleStartUnknown" BOOLEAN NOT NULL DEFAULT false,
    "roleEndYear" INTEGER,
    "roleEndMonth" INTEGER,
    "roleEndDay" INTEGER,
    "roleEndCirca" BOOLEAN NOT NULL DEFAULT false,
    "roleEndUnknown" BOOLEAN NOT NULL DEFAULT false,
    "stillServing" BOOLEAN NOT NULL DEFAULT false,
    "approximatePeriod" TEXT,
    "birthYear" INTEGER,
    "birthMonth" INTEGER,
    "birthDay" INTEGER,
    "birthCirca" BOOLEAN NOT NULL DEFAULT false,
    "birthUnknown" BOOLEAN NOT NULL DEFAULT false,
    "isDeceased" BOOLEAN NOT NULL DEFAULT false,
    "deathYear" INTEGER,
    "deathMonth" INTEGER,
    "deathDay" INTEGER,
    "deathCirca" BOOLEAN NOT NULL DEFAULT false,
    "deathUnknown" BOOLEAN NOT NULL DEFAULT false,
    "associatedContext" TEXT,
    "roleEvidenceUrl" TEXT,
    "photoUrl" TEXT,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "adminScaleValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subject_displayName_idx" ON "Subject"("displayName");

-- CreateIndex
CREATE INDEX "Subject_subjectType_idx" ON "Subject"("subjectType");

-- CreateIndex
CREATE INDEX "Post_subjectId_axis_idx" ON "Post"("subjectId", "axis");

-- CreateIndex
CREATE INDEX "ScaleSuggestion_subjectId_idx" ON "ScaleSuggestion"("subjectId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleSuggestion" ADD CONSTRAINT "ScaleSuggestion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
