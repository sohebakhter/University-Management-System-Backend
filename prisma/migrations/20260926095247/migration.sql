/*
  Warnings:

  - You are about to drop the column `providerPaymentId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bkashPaymentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';

-- DropIndex
DROP INDEX "payments_providerPaymentId_key";

-- DropIndex
DROP INDEX "payments_transactionId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "providerPaymentId",
DROP COLUMN "transactionId",
ADD COLUMN     "bkashPaymentId" TEXT,
ADD COLUMN     "bkashTrxId" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT',
ADD COLUMN     "getwayResponse" JSONB,
ADD COLUMN     "payerReference" TEXT,
ADD COLUMN     "refundAmount" DECIMAL(10,2),
ADD COLUMN     "refundReason" TEXT,
ADD COLUMN     "refundTrxId" TEXT,
ADD COLUMN     "refundedAt" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_bkashPaymentId_key" ON "payments"("bkashPaymentId");
