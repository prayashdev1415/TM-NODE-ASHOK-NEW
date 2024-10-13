-- CreateTable
CREATE TABLE "CompanyAndEmployeeMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "employeeSenderId" TEXT,
    "employeeReceiverId" TEXT,
    "companySenderId" TEXT,
    "companyReceiverId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAndEmployeeMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CompanyAndEmployeeMessage" ADD CONSTRAINT "CompanyAndEmployeeMessage_employeeSenderId_fkey" FOREIGN KEY ("employeeSenderId") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAndEmployeeMessage" ADD CONSTRAINT "CompanyAndEmployeeMessage_employeeReceiverId_fkey" FOREIGN KEY ("employeeReceiverId") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAndEmployeeMessage" ADD CONSTRAINT "CompanyAndEmployeeMessage_companySenderId_fkey" FOREIGN KEY ("companySenderId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAndEmployeeMessage" ADD CONSTRAINT "CompanyAndEmployeeMessage_companyReceiverId_fkey" FOREIGN KEY ("companyReceiverId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;
