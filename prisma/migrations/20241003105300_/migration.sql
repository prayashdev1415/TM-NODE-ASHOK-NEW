/*
  Warnings:

  - You are about to drop the column `subsciptionName` on the `SubscriptionPlans` table. All the data in the column will be lost.
  - Added the required column `subscriptionName` to the `SubscriptionPlans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlans" DROP COLUMN "subsciptionName",
ADD COLUMN     "subscriptionName" TEXT NOT NULL;
