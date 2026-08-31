-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "birthDateUnknown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthDay" INTEGER,
ADD COLUMN     "birthMonth" INTEGER,
ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "deathDateUnknown" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deathDay" INTEGER,
ADD COLUMN     "deathMonth" INTEGER,
ADD COLUMN     "deathYear" INTEGER,
ADD COLUMN     "isDeceased" BOOLEAN NOT NULL DEFAULT false;
