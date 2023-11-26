/*
  Warnings:

  - You are about to drop the column `linkURL` on the `SocialLink` table. All the data in the column will be lost.
  - You are about to drop the column `socialPlatform` on the `SocialLink` table. All the data in the column will be lost.
  - You are about to drop the column `websiteURL` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SocialLink" DROP COLUMN "linkURL",
DROP COLUMN "socialPlatform",
ADD COLUMN     "facebookURL" TEXT,
ADD COLUMN     "instagramURL" TEXT,
ADD COLUMN     "twitterURL" TEXT,
ADD COLUMN     "websiteURL" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "websiteURL";
