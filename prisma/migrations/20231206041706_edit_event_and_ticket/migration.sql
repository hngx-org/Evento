/*
  Warnings:

  - You are about to drop the column `entranceFee` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "entranceFee",
ADD COLUMN     "locationType" TEXT NOT NULL DEFAULT 'Physical',
ADD COLUMN     "virtualLocationLink" TEXT;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "price",
ADD COLUMN     "ticketPrice" DOUBLE PRECISION,
ALTER COLUMN "quantity" DROP NOT NULL,
ALTER COLUMN "isPaid" DROP NOT NULL,
ALTER COLUMN "isValid" DROP NOT NULL;
