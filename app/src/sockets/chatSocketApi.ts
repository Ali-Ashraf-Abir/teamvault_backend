// chatSocketApi.ts
import { Server, Socket } from "socket.io";
import { prisma } from "../../db/prisma";
import { userSocketMap } from ".";

export function chatSocketApi(io: Server, socket: Socket) {

  // --- Join user lobbies ---
  socket.on("join_user_lobbies", async ({ userId, serverId }) => {
    try {
      const lobbies = await prisma.lobby.findMany({
        where: {
          serverId,
          members: { some: { userId } },
        },
        select: { lobbyId: true },
      });

      for (const lobby of lobbies) {
        socket.join(lobby.lobbyId);
      }

      socket.emit("joined_lobbies", lobbies.map(l => l.lobbyId));
      console.log(`User ${userId} joined ${lobbies.length} lobbies in server ${serverId}`);
    } catch (error) {
      console.error("Error joining lobbies:", error);
    }
  });

  // --- Send message ---
  socket.on(
    "send_message",
    async ({
      serverId,
      lobbyId,
      sentBy,
      message,
    }: {
      serverId: string;
      lobbyId: string;
      sentBy: string;
      message: string;
    }) => {
      try {

        const isMember = await prisma.lobbyMembership.findUnique({
          where: { lobbyId_userId: { lobbyId, userId: sentBy } },
        });

        if (!isMember) {
          socket.emit("error_message", "You are not a member of this lobby");
          return;
        }

        const chat = await prisma.chat.create({
          data: { serverId, lobbyId, sentBy, message },
          include: { sender: true },
        });

        const lobbyMembers = await prisma.lobbyMembership.findMany({
          where: { lobbyId },
          select: { userId: true },
        });

        const notificationsData = lobbyMembers
          .filter((m) => m.userId !== sentBy)
          .map((m) => ({
            type: "message" as const,
            senderId: sentBy,
            recipientId: m.userId,
            serverId,
            lobbyId,
            chatId: chat.chatId,
            title: `New message from ${chat.sender.firstName} ${chat.sender.lastName}`,
            message: chat.message.length > 60 ? chat.message.slice(0, 60) + "..." : chat.message,
            link: `/server/${serverId}/lobbies/${lobbyId}`,
          }));

        if (notificationsData.length > 0) {
          await prisma.notification.createMany({
            data: notificationsData,
          });
        }

        // emitting real time chats and notifications back to the frontend
        io.to(lobbyId).emit("new_message", chat);
        for (const member of lobbyMembers) {
          if (member.userId !== sentBy) {
            const targetSocketId = userSocketMap.get(member.userId);
            io.to(targetSocketId).emit("new_notification", {
              type: "message",
              title: `New message from ${chat.sender.firstName}`,
              message: chat.message,
              lobbyId,
              link: `/server/${serverId}/lobbies/${lobbyId}`,
              createdAt: new Date()
            });
          }
        }

      } catch (err) {
        console.error("Error creating chat:", err);
        socket.emit("error_message", "Failed to send chat");
      }
    }
  );
}