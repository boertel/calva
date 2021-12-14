/*
  Warnings:

  - You are about to drop the column `endDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externalId,calendarId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "endDate",
DROP COLUMN "endTime",
DROP COLUMN "startDate",
DROP COLUMN "startTime",
ADD COLUMN     "end" TEXT NOT NULL,
ADD COLUMN     "start" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_externalId_calendarId_key" ON "Event"("externalId", "calendarId");
