/*
  Warnings:

  - A unique constraint covering the columns `[eventSlug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventSlug` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventSlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventSlug_key" ON "Event"("eventSlug");
