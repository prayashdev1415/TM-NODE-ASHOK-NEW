-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "dailyScreenshotCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastScreenshotReset" TIMESTAMP(3),
ADD COLUMN     "totalScreenShots" INTEGER NOT NULL DEFAULT 0;
