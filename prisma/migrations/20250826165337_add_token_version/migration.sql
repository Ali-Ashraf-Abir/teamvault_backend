/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAT` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Ping` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `userId` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "public"."ServerRole" AS ENUM ('owner', 'admin', 'member', 'guest');

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "createdAT",
DROP COLUMN "first_name",
DROP COLUMN "id",
DROP COLUMN "last_name",
DROP COLUMN "password",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" UUID NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("userId");

-- DropTable
DROP TABLE "public"."Ping";

-- CreateTable
CREATE TABLE "public"."Server" (
    "serverId" UUID NOT NULL,
    "serverName" TEXT NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("serverId")
);

-- CreateTable
CREATE TABLE "public"."ServerMembership" (
    "serverId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "public"."ServerRole" NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerMembership_pkey" PRIMARY KEY ("serverId","userId")
);

-- CreateTable
CREATE TABLE "public"."Lobby" (
    "lobbyId" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "lobbyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lobby_pkey" PRIMARY KEY ("lobbyId")
);

-- CreateTable
CREATE TABLE "public"."LobbyMembership" (
    "lobbyId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "role" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LobbyMembership_pkey" PRIMARY KEY ("lobbyId","userId")
);

-- CreateTable
CREATE TABLE "public"."Chat" (
    "chatId" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "lobbyId" UUID NOT NULL,
    "sentBy" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" TIMESTAMP(3),

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("chatId")
);

-- CreateTable
CREATE TABLE "public"."ChatReadReceipt" (
    "chatId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "seenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatReadReceipt_pkey" PRIMARY KEY ("chatId","userId")
);

-- CreateIndex
CREATE INDEX "Server_createdBy_idx" ON "public"."Server"("createdBy");

-- CreateIndex
CREATE INDEX "ServerMembership_userId_idx" ON "public"."ServerMembership"("userId");

-- CreateIndex
CREATE INDEX "Lobby_serverId_idx" ON "public"."Lobby"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "Lobby_serverId_lobbyName_key" ON "public"."Lobby"("serverId", "lobbyName");

-- CreateIndex
CREATE INDEX "LobbyMembership_userId_idx" ON "public"."LobbyMembership"("userId");

-- CreateIndex
CREATE INDEX "LobbyMembership_serverId_lobbyId_idx" ON "public"."LobbyMembership"("serverId", "lobbyId");

-- CreateIndex
CREATE INDEX "Chat_lobbyId_sentAt_idx" ON "public"."Chat"("lobbyId", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "Chat_serverId_sentAt_idx" ON "public"."Chat"("serverId", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "ChatReadReceipt_userId_idx" ON "public"."ChatReadReceipt"("userId");

-- AddForeignKey
ALTER TABLE "public"."Server" ADD CONSTRAINT "Server_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServerMembership" ADD CONSTRAINT "ServerMembership_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServerMembership" ADD CONSTRAINT "ServerMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lobby" ADD CONSTRAINT "Lobby_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyMembership" ADD CONSTRAINT "LobbyMembership_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("lobbyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyMembership" ADD CONSTRAINT "LobbyMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LobbyMembership" ADD CONSTRAINT "LobbyMembership_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("lobbyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatReadReceipt" ADD CONSTRAINT "ChatReadReceipt_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("chatId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatReadReceipt" ADD CONSTRAINT "ChatReadReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
