import { Router } from "express";

import { requireAuth } from "../middleware/authMiddleware";
import { ChatController } from "../controllers/chatControllers";

const router = Router();

// All chat routes are protected


router.get("/chats/:lobbyId", ChatController.getLobbyChats);
router.post("/chats/:lobbyId", ChatController.sendChat);

export default router;