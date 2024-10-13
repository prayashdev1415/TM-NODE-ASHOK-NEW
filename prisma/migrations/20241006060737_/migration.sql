-- CreateTable
CREATE TABLE "Keyword" (
    "KeywordId" SERIAL NOT NULL,
    "companyId" TEXT NOT NULL,
    "keyword" JSONB NOT NULL,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("KeywordId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Keyword_companyId_key" ON "Keyword"("companyId");

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;
