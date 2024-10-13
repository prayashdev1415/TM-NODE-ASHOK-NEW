-- CreateEnum
CREATE TYPE "StatusType" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "SubscriptionPlans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "billingCycle" TIMESTAMP(3) NOT NULL,
    "feature" JSONB NOT NULL,

    CONSTRAINT "SubscriptionPlans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "subscriptionPlansId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "StatusType" NOT NULL,
    "autoRenew" BOOLEAN NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_subscriptionPlansId_fkey" FOREIGN KEY ("subscriptionPlansId") REFERENCES "SubscriptionPlans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
