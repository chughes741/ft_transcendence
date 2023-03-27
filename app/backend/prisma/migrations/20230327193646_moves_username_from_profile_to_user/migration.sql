/*
  Warnings:

  - You are about to drop the column `username` on the `profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" DROP DEFAULT;
