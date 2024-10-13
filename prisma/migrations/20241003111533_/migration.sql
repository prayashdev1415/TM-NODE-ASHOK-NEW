/*
  Warnings:

  - Changed the type of `billingCycle` on the `SubscriptionPlans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlans" DROP COLUMN "billingCycle",
ADD COLUMN     "billingCycle" INTEGER NOT NULL;
