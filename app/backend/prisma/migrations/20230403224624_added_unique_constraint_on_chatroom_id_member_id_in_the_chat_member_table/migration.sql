/*
  Warnings:

  - A unique constraint covering the columns `[memberId,roomId]` on the table `chatMembers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "chatMembers_memberId_roomId_key" ON "chatMembers"("memberId", "roomId");
