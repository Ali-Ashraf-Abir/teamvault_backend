import { Request, Response } from "express";
import * as notificationService from "../services/notificationServices";

// GET /notifications/:recipientId?serverId=&lobbyId=&chatId=&cursor=
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { recipientId } = req.params;
    const { serverId, lobbyId, chatId, cursor } = req.query;

    if (!recipientId) return res.status(400).json({ error: "recipientId is required" });

    const notifications = await notificationService.getNotifications({
      recipientId,
      serverId: serverId as string,
      lobbyId: lobbyId as string,
      chatId: chatId as string,
      cursor: cursor as string,
      limit: 15,
    });

    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// POST /notifications/markRead/:recipientId
export const markNotificationsRead = async (req: Request, res: Response) => {
  try {
    const { recipientId } = req.params;
    const { serverId, lobbyId } = req.body;

    if (!recipientId) return res.status(400).json({ error: "recipientId is required" });

    const result = await notificationService.markNotificationsAsRead(recipientId, serverId, lobbyId);
    res.json({ updated: result.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};
