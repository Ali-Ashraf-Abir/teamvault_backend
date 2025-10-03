import { Request, Response } from "express";
import { LobbyService } from "../services/lobbyServices";

export const LobbyController = {
  async createLobby(req: Request, res: Response) {
    try {
      const { serverId, lobbyName, isPrivate, creatorId } = req.body;

      const lobby = await LobbyService.createLobby(serverId, lobbyName, isPrivate, creatorId);
      res.json({ ok: true, lobby });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  },

  async getServerLobbies(req: Request, res: Response) {
    try {
      const { serverId } = req.params;
      const lobbies = await LobbyService.getServerLobbies(serverId);
      res.json({ ok: true, lobbies });
    } catch (error: any) {
      res.status(400).json({ ok: false, error: error.message });
    }
  },

  async getLobby(req: Request, res: Response) {
    try {
      const { lobbyId } = req.params;
      const lobby = await LobbyService.getLobbyById(lobbyId);
      res.json(lobby);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateLobby(req: Request, res: Response) {
    try {
      const { lobbyId } = req.params;
      const { lobbyName } = req.body;
      const lobby = await LobbyService.updateLobby(lobbyId, lobbyName);
      res.json(lobby);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteLobby(req: Request, res: Response) {
    try {
      const { lobbyId } = req.params;
      await LobbyService.deleteLobby(lobbyId);
      res.json({ ok: true, message: "Lobby deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async addMember(req: Request, res: Response) {
    try {
      const { lobbyId } = req.params;
      const { serverId, userId, role } = req.body;
      const member = await LobbyService.addMember(lobbyId, serverId, userId, role);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async removeMember(req: Request, res: Response) {
    try {
      const { lobbyId, userId } = req.params;
      await LobbyService.removeMember(lobbyId, userId);
      res.json({ message: "Member removed from lobby" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },



    async addMembers(req: Request, res: Response) {
      try {
        const { lobbyId } = req.params;
        const { userIds, role } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({ error: "userIds must be a non-empty array" });
        }

        const result = await LobbyService.addMembers(lobbyId, userIds, role);

        res.json({ok:true,result});
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ok:false, error: error.message });
      }
    },


};
