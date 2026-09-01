/*
  Warnings:

  - You are about to drop the column `behaviorId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Behavior` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `behaviorLabel` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_behaviorId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "behaviorId",
ADD COLUMN     "behaviorLabel" TEXT NOT NULL;

-- DropTable
DROP TABLE "Behavior";
