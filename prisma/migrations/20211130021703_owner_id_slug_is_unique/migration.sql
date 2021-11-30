/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,slug]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Calendar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Calendar" ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "watchId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_ownerId_slug_key" ON "Calendar"("ownerId", "slug");
