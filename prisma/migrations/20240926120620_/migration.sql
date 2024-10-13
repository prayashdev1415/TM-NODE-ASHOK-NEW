/*
  Warnings:

  - You are about to drop the `_RoomParticipants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `receiverType` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderType` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('EMPLOYEE', 'COMPANY');

-- CreateEnum
CREATE TYPE "ReceiverType" AS ENUM ('EMPLOYEE', 'COMPANY');

-- DropForeignKey
ALTER TABLE "_RoomParticipants" DROP CONSTRAINT "_RoomParticipants_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipants" DROP CONSTRAINT "_RoomParticipants_B_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "receiverType" "ReceiverType" NOT NULL,
ADD COLUMN     "senderType" "SenderType" NOT NULL;

-- DropTable
DROP TABLE "_RoomParticipants";

-- CreateTable
CREATE TABLE "_RoomParticipantsEmployee" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_RoomParticipantsCompany" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomParticipantsEmployee_AB_unique" ON "_RoomParticipantsEmployee"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomParticipantsEmployee_B_index" ON "_RoomParticipantsEmployee"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomParticipantsCompany_AB_unique" ON "_RoomParticipantsCompany"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomParticipantsCompany_B_index" ON "_RoomParticipantsCompany"("B");

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_receiverId_fkey" TO "Message_ReceiverEmployee_fkey";

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_senderId_fkey" TO "Message_SenderEmployee_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_SenderCompany_fkey" FOREIGN KEY ("senderId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ReceiverCompany_fkey" FOREIGN KEY ("receiverId") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipantsEmployee" ADD CONSTRAINT "_RoomParticipantsEmployee_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipantsEmployee" ADD CONSTRAINT "_RoomParticipantsEmployee_B_fkey" FOREIGN KEY ("B") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipantsCompany" ADD CONSTRAINT "_RoomParticipantsCompany_A_fkey" FOREIGN KEY ("A") REFERENCES "companies"("companyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipantsCompany" ADD CONSTRAINT "_RoomParticipantsCompany_B_fkey" FOREIGN KEY ("B") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
