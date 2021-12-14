-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "externalId" TEXT,
ALTER COLUMN "endTime" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL;
