-- AlterTable
ALTER TABLE "ScaleSuggestion" ADD COLUMN     "replyToPostId" TEXT;

-- AddForeignKey
ALTER TABLE "ScaleSuggestion" ADD CONSTRAINT "ScaleSuggestion_replyToPostId_fkey" FOREIGN KEY ("replyToPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
