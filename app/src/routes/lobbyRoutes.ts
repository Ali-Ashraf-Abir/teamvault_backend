import { Router } from "express";
import { LobbyController } from "../controllers/lobbyControllers";


const router = Router();

// Lobby CRUD
router.post("/createLobby", LobbyController.createLobby);
router.get("/getServerLobbiesByServerId/:serverId", LobbyController.getServerLobbies);
router.get("/getLobbyByLobbyId/:lobbyId", LobbyController.getLobby);
router.put("/putLobbyByLobbyId/:lobbyId", LobbyController.updateLobby);
router.delete("/deleteLobbyByLobbyId/:lobbyId", LobbyController.deleteLobby);

// Lobby members
router.post("/addLobbyMembers/:lobbyId/members", LobbyController.addMember);
router.delete("/deleteLobbyMembers/:lobbyId/members/:userId", LobbyController.removeMember);

export default router;
