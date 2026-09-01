-- CreateEnum
CREATE TYPE "ExtremeBadge" AS ENUM ('UNFORGIVABLE', 'IMMORTAL');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "extremeBadge" "ExtremeBadge";
