/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `registrations` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "RegistrationStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "registrations" DROP COLUMN "deletedAt",
ADD COLUMN     "droppedAt" TIMESTAMP(3),
ADD COLUMN     "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'PENDING';
