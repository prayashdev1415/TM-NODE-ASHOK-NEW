-- CreateTable
CREATE TABLE "EmployeeTemp" (
    "employeeId" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "employeeAddress" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeTemp_pkey" PRIMARY KEY ("employeeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTemp_email_key" ON "EmployeeTemp"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTemp_phoneNumber_key" ON "EmployeeTemp"("phoneNumber");
