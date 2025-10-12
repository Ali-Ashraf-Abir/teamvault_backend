import { Router } from "express";
import { getNotifications, markNotificationsRead } from "../controllers/notificationController";

const router = Router();

// Get notifications (with optional serverId, lobbyId, chatId, cursor)
router.get("/getNotifications/:recipientId", getNotifications);

// Mark notifications as read
router.post("/markRead/:recipientId", markNotificationsRead);

export default router;
