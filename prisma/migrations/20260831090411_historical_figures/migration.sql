-- AlterEnum
ALTER TYPE "PersonaCategory" ADD VALUE 'HISTORICAL_FIGURE';

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "approximatePeriod" TEXT,
ADD COLUMN     "roleEndYear" INTEGER,
ADD COLUMN     "roleStartYear" INTEGER,
ALTER COLUMN "roleStartDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "conductDay" INTEGER,
ADD COLUMN     "conductEraNote" TEXT,
ADD COLUMN     "conductMonth" INTEGER,
ADD COLUMN     "conductYear" INTEGER,
ALTER COLUMN "conductDate" DROP NOT NULL;
