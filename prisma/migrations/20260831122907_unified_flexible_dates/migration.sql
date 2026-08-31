/*
  Warnings:

  - You are about to drop the column `birthDateUnknown` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `deathDateUnknown` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `roleEndDate` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `roleStartDate` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `conductDate` on the `Post` table. All the data in the column will be lost.
  - Made the column `conductYear` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Person" DROP COLUMN "birthDateUnknown",
DROP COLUMN "deathDateUnknown",
DROP COLUMN "roleEndDate",
DROP COLUMN "roleStartDate",
ADD COLUMN     "birthCirca" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthUnknown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deathCirca" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deathUnknown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleEndCirca" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleEndDay" INTEGER,
ADD COLUMN     "roleEndMonth" INTEGER,
ADD COLUMN     "roleEndUnknown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleStartCirca" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roleStartDay" INTEGER,
ADD COLUMN     "roleStartMonth" INTEGER,
ADD COLUMN     "roleStartUnknown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stillServing" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "conductDate",
ADD COLUMN     "conductCirca" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conductUnknown" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "conductYear" SET NOT NULL;
