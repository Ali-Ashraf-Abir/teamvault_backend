import { Request, Response, Router } from "express";
import { createServerController } from "../controllers/serverControllers";


const router = Router();

// POST /api/servers
router.post("/create-server", createServerController);

export default router;
