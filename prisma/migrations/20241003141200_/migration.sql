/*
  Warnings:

  - The values [SUCESS] on the enum `PaymentStatusType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatusType_new" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');
ALTER TABLE "Payments" ALTER COLUMN "status" TYPE "PaymentStatusType_new" USING ("status"::text::"PaymentStatusType_new");
ALTER TYPE "PaymentStatusType" RENAME TO "PaymentStatusType_old";
ALTER TYPE "PaymentStatusType_new" RENAME TO "PaymentStatusType";
DROP TYPE "PaymentStatusType_old";
COMMIT;
