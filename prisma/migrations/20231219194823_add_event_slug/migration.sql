/*
  Warnings:

  - A unique constraint covering the columns `[eventSlug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventSlug" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventSlug_key" ON "Event"("eventSlug");
