import { prisma } from "../../db/prisma";

export const LobbyService = {
    // Create a lobby
    async createLobby(serverId: string, lobbyName: string, isPrivate: boolean, creatorId: string) {
        return prisma.$transaction(async (tx) => {
            // Step 1: create the lobby
            const lobby = await tx.lobby.create({
                data: {
                    serverId,
                    lobbyName,
                    isPrivate
                },
            });

            // Step 2: fetch all server members
            const serverMembers = await tx.serverMembership.findMany({
                where: { serverId },
                select: { userId: true },
            });

            // Step 3: build membership list
            const memberships = [];

            // always add creator (in case server membership not synced yet)
            memberships.push({
                lobbyId: lobby.lobbyId,
                serverId,
                userId: creatorId,
                role: "owner", // optional: mark creator as owner/mod
            });

            // if lobby is not private, add everyone else from server
            if (!isPrivate) {
                for (const member of serverMembers) {
                    // prevent double insert if creator is also in serverMembers
                    if (member.userId !== creatorId) {
                        memberships.push({
                            lobbyId: lobby.lobbyId,
                            serverId,
                            userId: member.userId,
                            role: 'member',
                        });
                    }
                }
            }

            // Step 4: bulk insert lobby memberships
            if (memberships.length > 0) {
                await tx.lobbyMembership.createMany({ data: memberships });
            }

            return lobby;
        });
    },


    // Get all lobbies for a server
    async getServerLobbies(serverId: string) {
        return prisma.lobby.findMany({
            where: { serverId },
            include: { members: true, chats: true },
        });
    },

    // Get a single lobby by ID
    async getLobbyById(lobbyId: string) {
        return prisma.lobby.findUnique({
            where: { lobbyId },
            include: {
                members: {
                    include: {
                        user: true,
                    }
                }, chats: true
            },
        });
    },
    async getLobbiesByUserAndServerService(serverId: string, userId: string) {
        return await prisma.lobby.findMany({
            where: {
                serverId,
                members: {
                    some: { userId },
                },
            },
            include: {
                members: {
                    select: { userId: true },
                },
            },
        });
    },

    // Update lobby name
    async updateLobby(lobbyId: string, lobbyName: string) {
        return prisma.lobby.update({
            where: { lobbyId },
            data: { lobbyName },
        });
    },

    // Delete a lobby
    async deleteLobby(lobbyId: string) {
        return prisma.lobby.delete({
            where: { lobbyId },
        });
    },

    // Add a member to lobby
    async addMember(lobbyId: string, serverId: string, userId: string, role?: string) {
        return prisma.lobbyMembership.create({
            data: {
                lobbyId,
                serverId,
                userId,
                role,
            },
        });
    },

    async addMembers(lobbyId: string, userIds: string[], role: string | null = null) {
        const lobby = await prisma.lobby.findUnique({
            where: { lobbyId },
            select: { serverId: true },
        });

        if (!lobby) throw new Error("Lobby not found");

        const serverId = lobby.serverId;

        // 2. Filter out users not in the server
        const serverMembers = await prisma.serverMembership.findMany({
            where: {
                serverId,
                userId: { in: userIds },
            },
            select: { userId: true },
        });

        const validUserIds = serverMembers.map((m) => m.userId);

        if (validUserIds.length === 0) {
            return { added: 0, message: "No valid users found (must be server members)" };
        }

        const existing = await prisma.lobbyMembership.findMany({
            where: {
                lobbyId,
                userId: { in: validUserIds },
            },
            select: { userId: true },
        });

        const existingIds = existing.map((m) => m.userId);
        const newUserIds = validUserIds.filter((id) => !existingIds.includes(id));

        if (newUserIds.length === 0) {
            return { added: 0, message: "All users are already in the lobby" };
        }

        // 4. Prepare data for bulk insert
        const data = newUserIds.map((userId) => ({
            lobbyId,
            serverId,
            userId,
            role,
        }));

        await prisma.lobbyMembership.createMany({ data });

        return { added: newUserIds.length, addedUserIds: newUserIds };
    },


    // Remove a member
    async removeMember(lobbyId: string, userId: string) {
        return prisma.lobbyMembership.delete({
            where: {
                lobbyId_userId: { lobbyId, userId },
            },
        });
    },
};
