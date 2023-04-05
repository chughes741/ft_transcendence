/*
  Warnings:

  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT NOT NULL DEFAULT 'default_avatar.png',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE';

-- DropTable
DROP TABLE "profiles";

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
