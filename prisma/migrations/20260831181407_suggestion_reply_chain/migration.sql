-- AlterTable
ALTER TABLE "ScaleSuggestion" ADD COLUMN     "replyToId" TEXT;

-- AddForeignKey
ALTER TABLE "ScaleSuggestion" ADD CONSTRAINT "ScaleSuggestion_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "ScaleSuggestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
