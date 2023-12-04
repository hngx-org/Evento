/*
  Warnings:

  - You are about to drop the column `otp_ascii` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_auth_url` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_base32` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otp_hex` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otp_ascii",
DROP COLUMN "otp_auth_url",
DROP COLUMN "otp_base32",
DROP COLUMN "otp_hex";

-- CreateTable
CREATE TABLE "OTP" (
    "userID" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("userID")
);

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;
