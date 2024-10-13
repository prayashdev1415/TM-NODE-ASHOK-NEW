/*
  Warnings:

  - The primary key for the `Keyword` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Keyword" DROP CONSTRAINT "Keyword_pkey",
ALTER COLUMN "KeywordId" DROP DEFAULT,
ALTER COLUMN "KeywordId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Keyword_pkey" PRIMARY KEY ("KeywordId");
DROP SEQUENCE "Keyword_KeywordId_seq";
