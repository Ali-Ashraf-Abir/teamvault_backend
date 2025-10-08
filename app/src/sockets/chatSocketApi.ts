// chatSocketApi.ts
import { Server, Socket } from "socket.io";
import { prisma } from "../../db/prisma";

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
    async ({ serverId, lobbyId, sentBy, message }: { serverId: string; lobbyId: string; sentBy: string; message: string }) => {
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

        io.to(lobbyId).emit("new_message", chat);
      } catch (err) {
        console.error("Error creating chat:", err);
        socket.emit("error_message", "Failed to send chat");
      }
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
}
