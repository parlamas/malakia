-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "adminScaleValue" INTEGER;

-- CreateTable
CREATE TABLE "ScaleSuggestion" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScaleSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScaleSuggestion_personId_idx" ON "ScaleSuggestion"("personId");

-- AddForeignKey
ALTER TABLE "ScaleSuggestion" ADD CONSTRAINT "ScaleSuggestion_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScaleSuggestion" ADD CONSTRAINT "ScaleSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
