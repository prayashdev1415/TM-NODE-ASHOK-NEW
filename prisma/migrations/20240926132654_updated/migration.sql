/*
  Warnings:

  - You are about to drop the column `receiverType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderType` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `_RoomParticipantsCompany` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoomParticipantsEmployee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_ReceiverCompany_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_SenderCompany_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipantsCompany" DROP CONSTRAINT "_RoomParticipantsCompany_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipantsCompany" DROP CONSTRAINT "_RoomParticipantsCompany_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipantsEmployee" DROP CONSTRAINT "_RoomParticipantsEmployee_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomParticipantsEmployee" DROP CONSTRAINT "_RoomParticipantsEmployee_B_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "receiverType",
DROP COLUMN "senderType";

-- DropTable
DROP TABLE "_RoomParticipantsCompany";

-- DropTable
DROP TABLE "_RoomParticipantsEmployee";

-- DropEnum
DROP TYPE "ReceiverType";

-- DropEnum
DROP TYPE "SenderType";

-- CreateTable
CREATE TABLE "_RoomParticipants" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomParticipants_AB_unique" ON "_RoomParticipants"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomParticipants_B_index" ON "_RoomParticipants"("B");

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_ReceiverEmployee_fkey" TO "Message_receiverId_fkey";

-- RenameForeignKey
ALTER TABLE "Message" RENAME CONSTRAINT "Message_SenderEmployee_fkey" TO "Message_senderId_fkey";

-- AddForeignKey
ALTER TABLE "_RoomParticipants" ADD CONSTRAINT "_RoomParticipants_A_fkey" FOREIGN KEY ("A") REFERENCES "employees"("employeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomParticipants" ADD CONSTRAINT "_RoomParticipants_B_fkey" FOREIGN KEY ("B") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
