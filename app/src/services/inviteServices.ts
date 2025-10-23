import { addDays } from "date-fns";
import { prisma } from "../../db/prisma";
import { InviteStatus, UserInvite } from "@prisma/client";


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

export const userInviteService = {
    async sendInvite(serverId: string, invitedBy: string, invitedUserId: string): Promise<UserInvite> {
        const existing = await prisma.userInvite.findFirst({
            where: { serverId, invitedBy, invitedUserId, status: InviteStatus.pending },
        });
        if (existing) throw new Error("Invite already sent");

        return prisma.userInvite.create({
            data: { serverId, invitedBy, invitedUserId },
            include: {
                invitedUser: {
                    select: { userId: true, firstName: true, lastName: true }
                }
            }
        });
    },

    async getReceivedInvites(userId: string) {
        return prisma.userInvite.findMany({
            where: {
                invitedUserId: userId,
                NOT: { status: "cancelled" }
            },
            include: {
                sender: { select: { userId: true, firstName: true, lastName: true } },
                server: { select: { serverId: true, serverName: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    async getSentInvites(userId: string) {
        return prisma.userInvite.findMany({
            where: {
                invitedBy: userId,
                NOT: { status: "cancelled" }
            },
            include: {
                invitedUser: { select: { userId: true, firstName: true, lastName: true } },
                server: { select: { serverId: true, serverName: true } },
            },
            orderBy: { createdAt: "desc" },
        });
    },

    async acceptInvite(inviteId: string) {

        const invite = await prisma.userInvite.update({
            where: { inviteId },
            data: { status: InviteStatus.accepted },
        });

        await prisma.serverMembership.upsert({
            where: { serverId_userId: { serverId: invite.serverId, userId: invite.invitedUserId } },
            update: {},
            create: {
                serverId: invite.serverId,
                userId: invite.invitedUserId,
                role: "member",
            },
        });


        const publicLobbies = await prisma.lobby.findMany({
            where: {
                serverId: invite.serverId,
                isPrivate: false,
            },
            select: { lobbyId: true },
        });


        if (publicLobbies.length > 0) {
            await prisma.$transaction(
                publicLobbies.map(lobby =>
                    prisma.lobbyMembership.upsert({
                        where: {
                            lobbyId_userId: {
                                lobbyId: lobby.lobbyId,
                                userId: invite.invitedUserId,
                            },
                        },
                        update: {},
                        create: {
                            lobbyId: lobby.lobbyId,
                            userId: invite.invitedUserId,
                            serverId: invite.serverId,
                            role: "member",
                        },
                    })
                )
            );
        }

        return invite;
    },

    async rejectInvite(inviteId: string): Promise < UserInvite > {
    return prisma.userInvite.update({
        where: { inviteId },
        data: { status: InviteStatus.rejected },
    });
},

    async cancelInvite(inviteId: string, userId: string): Promise < UserInvite > {
        const invite = await prisma.userInvite.findUnique({ where: { inviteId } });
        if(!invite) throw new Error("Invite not found");
        if(invite.invitedBy !== userId) throw new Error("Unauthorized");

        return prisma.userInvite.update({
            where: { inviteId },
            data: { status: InviteStatus.cancelled },
        });
    },
};


