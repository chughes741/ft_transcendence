/*
  Warnings:

  - The values [DISCONNECTED] on the enum `ChatMemberRank` will be removed. If these variants are still used in the database, this will fail.
  - The values [BLOCKED] on the enum `ChatMemberStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Match` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Player` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('RANKED', 'UNRANKED');

-- AlterEnum
BEGIN;
CREATE TYPE "ChatMemberRank_new" AS ENUM ('USER', 'ADMIN', 'OWNER');
ALTER TABLE "chatMembers" ALTER COLUMN "rank" TYPE "ChatMemberRank_new" USING ("rank"::text::"ChatMemberRank_new");
ALTER TYPE "ChatMemberRank" RENAME TO "ChatMemberRank_old";
ALTER TYPE "ChatMemberRank_new" RENAME TO "ChatMemberRank";
DROP TYPE "ChatMemberRank_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ChatMemberStatus_new" AS ENUM ('OK', 'MUTED', 'BANNED');
ALTER TABLE "chatMembers" ALTER COLUMN "status" TYPE "ChatMemberStatus_new" USING ("status"::text::"ChatMemberStatus_new");
ALTER TYPE "ChatMemberStatus" RENAME TO "ChatMemberStatus_old";
ALTER TYPE "ChatMemberStatus_new" RENAME TO "ChatMemberStatus";
DROP TYPE "ChatMemberStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_matchId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_memberId_fkey";

-- DropTable
DROP TABLE "Match";

-- DropTable
DROP TABLE "Player";

-- DropEnum
DROP TYPE "MatchStatus";

-- DropEnum
DROP TYPE "PlayerSide";

-- CreateTable
CREATE TABLE "matches" (
    "id" SERIAL NOT NULL,
    "roomId" TEXT,
    "gameType" "GameType" NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "scorePlayer1" INTEGER NOT NULL,
    "scorePlayer2" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
