-- AlterTable
ALTER TABLE "MessageMedia" ADD COLUMN     "companyAndEmployeeMessageId" TEXT,
ALTER COLUMN "messageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MessageMedia" ADD CONSTRAINT "MessageMedia_companyAndEmployeeMessageId_fkey" FOREIGN KEY ("companyAndEmployeeMessageId") REFERENCES "CompanyAndEmployeeMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
