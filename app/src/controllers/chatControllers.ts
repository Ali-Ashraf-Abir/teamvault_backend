import { Request, Response } from "express";

import { fail } from "../utils/http";
import { ChatService } from "../services/chatServices";
import { prisma } from "../../db/prisma";

export const ChatController = {
  async getLobbyChats(req: Request, res: Response) {
    const { lobbyId } = req.params;
    if (!lobbyId) return fail(res, "BAD_REQUEST", "Lobby ID is required", 400);

    try {
      const chats = await ChatService.getLobbyChats(lobbyId);
      return res.json({ success: true, data: chats });
    } catch (err) {
      console.error(err);
      return fail(res, "SERVER_ERROR", "Failed to fetch chats");
    }
  },

  async sendChat(req: Request, res: Response) {
    const { lobbyId } = req.params;
    const { message,userId } = req.body;


    if (!lobbyId || !message) return fail(res, "BAD_REQUEST", "Lobby ID and message are required", 400);

    try {
      // Get serverId from lobby (optional validation)
      const lobby = await prisma.lobby.findUnique({ where: { lobbyId } });
      if (!lobby) return fail(res, "NOT_FOUND", "Lobby not found", 404);

      const chat = await ChatService.createChat(lobbyId, lobby.serverId, userId, message);

      // Optionally: emit via socket here
      // io.to(lobbyId).emit("new_message", chat);

      return res.json({ success: true, data: chat });
    } catch (err) {
      console.error(err);
      return fail(res, "SERVER_ERROR", "Failed to send chat");
    }
  },
};
