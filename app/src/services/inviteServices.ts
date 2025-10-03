import { addDays } from "date-fns";
import { prisma } from "../../db/prisma";


class InviteService {
    async createInvite(serverId: string, createdBy: string, options?: {
        expiresInDays?: number,
        maxUses?: number
    }) {
        const code = Math.random().toString(36).substring(2, 8); // simple random code

        const invite = await prisma.serverInvite.create({
            data: {
                serverId,
                createdBy,
                code,
                expiresAt: options?.expiresInDays ? addDays(new Date(), options.expiresInDays) : null,
                maxUses: options?.maxUses ?? null
            }
        });

        return invite;
    }

    async getInvite(code: string) {
        const invite = await prisma.serverInvite.findUnique({
            where: { code },
            include: { server: true, creator: true }
        });

        if (!invite) throw new Error("Invite not found");
        return invite;
    }

    async redeemInvite(code: string, userId: string) {
        const invite = await prisma.serverInvite.findUnique({
            where: { code },
            include: { redempions: true }
        });
        console.log(invite)
        if (!invite) throw new Error("Invalid invite");
        if (invite.revoked) throw new Error("This invite has been revoked");
        if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("Invite expired");
        if (invite.maxUses && invite.uses >= invite.maxUses) throw new Error("Invite max uses reached");

        const alreadyRedeemed = await prisma.inviteRedemption.findFirst({
            where: { inviteId: invite.inviteId, userId }
        });

        if (alreadyRedeemed) throw new Error("User already redeemed this invite");
        const alreadyInServer = await prisma.serverMembership.findFirst({
            where: {
                serverId: invite.serverId,
                userId
            }
        });
        if (alreadyInServer) throw new Error("User already in the server");
        // Transaction: increment uses + add redemption
        const [updatedInvite, redemption] = await prisma.$transaction([
            prisma.serverInvite.update({
                where: { inviteId: invite.inviteId },
                data: { uses: { increment: 1 } }
            }),
            prisma.inviteRedemption.create({
                data: { inviteId: invite.inviteId, userId }
            }),
            prisma.serverMembership.create({
                data: {
                    serverId: invite.serverId,
                    userId
                }
            })
        ]);

        return { invite: updatedInvite, redemption };
    }

    async revokeInvite(inviteId: string) {
        return prisma.serverInvite.update({
            where: { inviteId },
            data: { revoked: true }
        });
    }

    async getInvitesByServerId(serverId: string) {
        return prisma.serverInvite.findMany({
            where: { serverId },
            include: {
                creator: {
                    select: { userId: true, firstName: true, lastName: true, email: true },
                },
                redempions: {
                    include: {
                        user: {
                            select: { userId: true, firstName: true, lastName: true, email: true },
                        },
                    },
                },
            },
        });
    }

    async getInvitesByUserAndServer(userId: string, serverId: string) {
        return prisma.serverInvite.findMany({
            where: { serverId, createdBy: userId },
            include: {
                creator: { select: { userId: true, firstName: true, lastName: true, email: true } },
                redempions: true,
            },
        });
    }
}

export default new InviteService();
