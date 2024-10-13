-- CreateTable
CREATE TABLE "FreeTrail" (
    "freeTrailId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,

    CONSTRAINT "FreeTrail_pkey" PRIMARY KEY ("freeTrailId")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreeTrail_companyId_key" ON "FreeTrail"("companyId");

-- AddForeignKey
ALTER TABLE "FreeTrail" ADD CONSTRAINT "FreeTrail_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;
