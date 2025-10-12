/*
  Warnings:

  - The values [guest] on the enum `ServerRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('message', 'dm', 'user_invite', 'file_shared', 'system');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ServerRole_new" AS ENUM ('owner', 'admin', 'member', 'moderator');
ALTER TABLE "public"."ServerMembership" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."ServerMembership" ALTER COLUMN "role" TYPE "public"."ServerRole_new" USING ("role"::text::"public"."ServerRole_new");
ALTER TYPE "public"."ServerRole" RENAME TO "ServerRole_old";
ALTER TYPE "public"."ServerRole_new" RENAME TO "ServerRole";
DROP TYPE "public"."ServerRole_old";
ALTER TABLE "public"."ServerMembership" ALTER COLUMN "role" SET DEFAULT 'member';
COMMIT;

-- CreateTable
CREATE TABLE "public"."Notification" (
    "notificationId" UUID NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "senderId" UUID,
    "recipientId" UUID NOT NULL,
    "serverId" UUID,
    "lobbyId" UUID,
    "chatId" UUID,
    "fileId" UUID,
    "inviteId" UUID,
    "title" TEXT,
    "message" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "public"."Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Notification_serverId_idx" ON "public"."Notification"("serverId");

-- CreateIndex
CREATE INDEX "Notification_lobbyId_idx" ON "public"."Notification"("lobbyId");

-- CreateIndex
CREATE INDEX "Notification_chatId_idx" ON "public"."Notification"("chatId");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "public"."Lobby"("lobbyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("chatId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "public"."UserInvite"("inviteId") ON DELETE CASCADE ON UPDATE CASCADE;
