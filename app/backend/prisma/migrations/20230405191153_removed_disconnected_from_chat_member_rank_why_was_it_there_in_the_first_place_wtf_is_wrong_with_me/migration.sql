/*
  Warnings:

  - The values [DISCONNECTED] on the enum `ChatMemberRank` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChatMemberRank_new" AS ENUM ('USER', 'ADMIN', 'OWNER');
ALTER TABLE "chatMembers" ALTER COLUMN "rank" TYPE "ChatMemberRank_new" USING ("rank"::text::"ChatMemberRank_new");
ALTER TYPE "ChatMemberRank" RENAME TO "ChatMemberRank_old";
ALTER TYPE "ChatMemberRank_new" RENAME TO "ChatMemberRank";
DROP TYPE "ChatMemberRank_old";
COMMIT;
