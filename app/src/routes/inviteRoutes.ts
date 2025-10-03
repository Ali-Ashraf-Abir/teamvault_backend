import { Router } from "express";
import inviteControllers from "../controllers/inviteControllers";


const router = Router();

router.post("/invite/createInvite", inviteControllers.createInvite);            // POST /invites
router.get("/invite/getInvite/:code", inviteControllers.getInvite);           // GET /invites/:code
router.post("/invite/redeemInvite/:code", inviteControllers.redeemInvite);// POST /invites/:code/redeem
router.post("/invite/revokeInvite/:inviteId", inviteControllers.revokeInvite);// POST /invites/:code/revoke
router.get("/server/:serverId/invites", inviteControllers.getInvitesByServer);
router.get("/server/:serverId/user/:userId/invites", inviteControllers.getInvitesByUser);
export default router;
