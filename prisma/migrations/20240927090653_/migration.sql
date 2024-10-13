-- AlterTable
ALTER TABLE "CompanyAndEmployeeMessage" ADD COLUMN     "roomId" TEXT;

-- CreateTable
CREATE TABLE "CompanyAndEmployeeRoom" (
    "id" TEXT NOT NULL,

    CONSTRAINT "CompanyAndEmployeeRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "employeeId" TEXT,
    "companyId" TEXT,

    CONSTRAINT "RoomParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomParticipant_roomId_employeeId_companyId_key" ON "RoomParticipant"("roomId", "employeeId", "companyId");

-- AddForeignKey
ALTER TABLE "CompanyAndEmployeeMessage" ADD CONSTRAINT "CompanyAndEmployeeMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CompanyAndEmployeeRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CompanyAndEmployeeRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomParticipant" ADD CONSTRAINT "RoomParticipant_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;
