/*
  Warnings:

  - You are about to drop the column `body` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `conversationId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `conversationsIds` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ConversationToEmployee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToEmployee" DROP CONSTRAINT "_ConversationToEmployee_A_fkey";

-- DropForeignKey
ALTER TABLE "_ConversationToEmployee" DROP CONSTRAINT "_ConversationToEmployee_B_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "body",
DROP COLUMN "conversationId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "day" TEXT,
ALTER COLUMN "appLogo" DROP NOT NULL,
ALTER COLUMN "appType" DROP DEFAULT;

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "conversationsIds";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "_ConversationToEmployee";

-- CreateTable
CREATE TABLE "appreviews" (
    "appName" TEXT NOT NULL,
    "appLogo" TEXT,
    "appReview" "AppType" NOT NULL DEFAULT 'NEUTRAL',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appreviews_pkey" PRIMARY KEY ("appName","companyId")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "appreviews_appName_key" ON "appreviews"("appName");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomParticipants_AB_unique" ON "_RoomParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomParticipants_B_index" ON "_RoomParticipants"("B");

-- AddForeignKey
ALTER TABLE "appreviews" ADD CONSTRAINT "appreviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipants" ADD CONSTRAINT "_RoomParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipants" ADD CONSTRAINT "_RoomParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
