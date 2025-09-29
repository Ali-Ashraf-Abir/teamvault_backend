-- CreateEnum
CREATE TYPE "public"."InviteStatus" AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- CreateTable
CREATE TABLE "public"."ServerInvite" (
    "inviteId" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ServerInvite_pkey" PRIMARY KEY ("inviteId")
);

-- CreateTable
CREATE TABLE "public"."InviteRedemption" (
    "redemptionId" UUID NOT NULL,
    "inviteId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteRedemption_pkey" PRIMARY KEY ("redemptionId")
);

-- CreateTable
CREATE TABLE "public"."UserInvite" (
    "inviteId" UUID NOT NULL,
    "serverId" UUID NOT NULL,
    "invitedBy" UUID NOT NULL,
    "invitedUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."InviteStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "UserInvite_pkey" PRIMARY KEY ("inviteId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServerInvite_code_key" ON "public"."ServerInvite"("code");

-- CreateIndex
CREATE INDEX "ServerInvite_serverId_idx" ON "public"."ServerInvite"("serverId");

-- CreateIndex
CREATE INDEX "ServerInvite_code_idx" ON "public"."ServerInvite"("code");

-- CreateIndex
CREATE INDEX "InviteRedemption_inviteId_idx" ON "public"."InviteRedemption"("inviteId");

-- CreateIndex
CREATE INDEX "InviteRedemption_userId_idx" ON "public"."InviteRedemption"("userId");

-- CreateIndex
CREATE INDEX "UserInvite_serverId_idx" ON "public"."UserInvite"("serverId");

-- CreateIndex
CREATE INDEX "UserInvite_invitedUserId_idx" ON "public"."UserInvite"("invitedUserId");

-- AddForeignKey
ALTER TABLE "public"."ServerInvite" ADD CONSTRAINT "ServerInvite_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServerInvite" ADD CONSTRAINT "ServerInvite_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InviteRedemption" ADD CONSTRAINT "InviteRedemption_inviteId_fkey" FOREIGN KEY ("inviteId") REFERENCES "public"."ServerInvite"("inviteId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InviteRedemption" ADD CONSTRAINT "InviteRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvite" ADD CONSTRAINT "UserInvite_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "public"."Server"("serverId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvite" ADD CONSTRAINT "UserInvite_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserInvite" ADD CONSTRAINT "UserInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "public"."User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
