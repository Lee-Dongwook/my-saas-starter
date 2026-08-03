/*
  Warnings:

  - You are about to drop the column `groupId` on the `subscription` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "subscription" DROP COLUMN "groupId",
ADD COLUMN     "billingInterval" TEXT,
ADD COLUMN     "cancelAt" TIMESTAMP(3),
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "stripeScheduleId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "subscription_referenceId_idx" ON "subscription"("referenceId");
