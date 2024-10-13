/*
  Warnings:

  - You are about to drop the column `name` on the `SubscriptionPlans` table. All the data in the column will be lost.
  - Added the required column `subsciptionName` to the `SubscriptionPlans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlans" DROP COLUMN "name",
ADD COLUMN     "subsciptionName" TEXT NOT NULL;
