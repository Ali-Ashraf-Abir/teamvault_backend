import { Router } from "express";
import inviteControllers, { userInviteController } from "../controllers/inviteControllers";


const router = Router();

router.post("/invite/createInvite", inviteControllers.createInvite);            // POST /invites
router.get("/invite/getInvite/:code", inviteControllers.getInvite);           // GET /invites/:code
router.post("/invite/redeemInvite/:code", inviteControllers.redeemInvite);// POST /invites/:code/redeem
router.post("/invite/revokeInvite/:inviteId", inviteControllers.revokeInvite);// POST /invites/:code/revoke
router.get("/server/:serverId/invites", inviteControllers.getInvitesByServer);
router.get("/server/:serverId/user/:userId/invites", inviteControllers.getInvitesByUser);
router.post("/userInvite/send", userInviteController.send);
router.get("/userInvite/received/:userId", userInviteController.getReceived);
router.get("/userInvite/sent/:userId", userInviteController.getSent);
router.post("/userInvite/accept/:inviteId", userInviteController.accept);
router.post("/userInvite/reject/:inviteId", userInviteController.reject);
router.delete("/userInvite/cancel/:inviteId", userInviteController.cancel);
export default router;
