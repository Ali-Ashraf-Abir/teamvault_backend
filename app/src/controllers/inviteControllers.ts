import { Request, Response } from "express";
import inviteServices from "../services/inviteServices";


class InviteController {
    async createInvite(req: Request, res: Response) {
        try {
            const { serverId, createdBy, expiresInDays, maxUses } = req.body;
            const invite = await inviteServices.createInvite(serverId, createdBy, { expiresInDays, maxUses });
            res.json({ ok: true, invite });
        } catch (err: any) {
            res.status(400).json({ ok: false, error: err.message });
        }
    }

    async getInvite(req: Request, res: Response) {
        try {
            const { code } = req.params;
            const invite = await inviteServices.getInvite(code);
            res.json(invite);
        } catch (err: any) {
            res.status(404).json({ error: err.message });
        }
    }

    async redeemInvite(req: Request, res: Response) {
        try {
            const { code } = req.params;
            const { userId } = req.body;
            const redemption = await inviteServices.redeemInvite(code, userId);
            res.json({ ok: true, redemption });
        } catch (err: any) {
            res.status(400).json({ ok: false, error: err.message });
        }
    }

    async revokeInvite(req: Request, res: Response) {
        try {
            const { inviteId } = req.params;
            const revoked = await inviteServices.revokeInvite(inviteId);
            res.json({ok:true,revoked});
        } catch (err: any) {
            res.status(400).json({ok:false, error: err.message });
        }
    }

    async getInvitesByServer(req: Request, res: Response) {
        try {
            const { serverId } = req.params;
            const invites = await inviteServices.getInvitesByServerId(serverId);
            res.json(invites);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    // GET /servers/:serverId/users/:userId/invites
    async getInvitesByUser(req: Request, res: Response) {
        try {
            const { serverId, userId } = req.params;
            const invites = await inviteServices.getInvitesByUserAndServer(userId, serverId);
            res.json(invites);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default new InviteController();
