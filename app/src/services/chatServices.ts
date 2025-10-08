import { prisma } from "../../db/prisma";


export const ChatService = {
  async getLobbyChats(lobbyId: string) {
    return prisma.chat.findMany({
      where: { lobbyId },
      orderBy: { sentAt: "asc" },
      include: {
        sender: {
          select: { userId: true, firstName: true, lastName: true },
        },
      },
    });
  },

  async createChat(lobbyId: string, serverId: string, userId: string, message: string) {
    return prisma.chat.create({
      data: {
        lobbyId,
        serverId,
        sentBy: userId,
        message,
      },
      include: {
        sender: {
          select: { userId: true, firstName: true, lastName: true },
        },
      },
    });
  },
};
