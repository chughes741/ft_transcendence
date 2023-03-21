/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `chatRooms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chatRooms" ALTER COLUMN "name" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "chatRooms_name_key" ON "chatRooms"("name");
