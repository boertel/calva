/*
  Warnings:

  - You are about to drop the column `accountId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `end` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `start` on the `Event` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recurrence` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timezone` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "accountId",
DROP COLUMN "end",
DROP COLUMN "start",
ADD COLUMN     "endDate" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "recurrence" TEXT NOT NULL,
ADD COLUMN     "startDate" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "timezone" TEXT NOT NULL;
