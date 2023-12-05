/*
  Warnings:

  - You are about to drop the column `notificationPreferences` on the `Preferences` table. All the data in the column will be lost.
  - The `regionalSettings` column on the `Preferences` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Preferences" DROP COLUMN "notificationPreferences",
ADD COLUMN     "theme" TEXT,
ADD COLUMN     "timeZone" TEXT,
DROP COLUMN "regionalSettings",
ADD COLUMN     "regionalSettings" BOOLEAN NOT NULL DEFAULT false;
