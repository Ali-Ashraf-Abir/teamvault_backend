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
        // 🧩 Step 1: Check membership
        const isMember = await prisma.lobbyMembership.findUnique({
          where: { lobbyId_userId: { lobbyId, userId: sentBy } },
        });

        if (!isMember) {
          socket.emit("error_message", "You are not a member of this lobby");
          return;
        }

        // 💬 Step 2: Create chat message
        const chat = await prisma.chat.create({
          data: { serverId, lobbyId, sentBy, message },
          include: { sender: true },
        });

        // 👥 Step 3: Get all lobby members (recipients)
        const lobbyMembers = await prisma.lobbyMembership.findMany({
          where: { lobbyId },
          select: { userId: true },
        });

        // 📨 Step 4: Create notifications for all except sender
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
            link: `/servers/${serverId}/lobbies/${lobbyId}`,
          }));

        if (notificationsData.length > 0) {
          await prisma.notification.createMany({
            data: notificationsData,
          });
        }

        // ⚡ Step 5: Broadcast message to all lobby members
        io.to(lobbyId).emit("new_message", chat);
        // io.to(lobbyId).emit("new_notification",{
        //       type: "LOBBY_MESSAGE",
        //       title: `New message from ${chat.sender.firstName}`,
        //       message: chat.message,
        //       link: `/server/${serverId}/lobbies/${lobbyId}`,
        //     })
        for (const member of lobbyMembers) {
          if (member.userId !== sentBy) {
            const targetSocketId = userSocketMap.get(member.userId);
            io.to(targetSocketId).emit("new_notification", {
              type: "LOBBY_MESSAGE",
              title: `New message from ${chat.sender.firstName}`,
              message: chat.message,
              link: `/server/${serverId}/lobbies/${lobbyId}`,
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