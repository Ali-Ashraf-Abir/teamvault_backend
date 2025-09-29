import { Request, Response, Router } from "express";
import { createServerController, getServerByIdController, getServerByUserIdController } from "../controllers/serverControllers";


const router = Router();

// POST /api/servers
router.post("/create-server", createServerController);
router.get("/getServerByServerId/:id", getServerByIdController);
router.get("/getServerByUserId/:userId", getServerByUserIdController);

export default router;
