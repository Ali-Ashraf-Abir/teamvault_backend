import { Router } from "express";
import { createUserController } from "../controllers/authController";
import { validate } from "../utils/validation";
import { createUserModel } from "../models/User";

const router=Router()


router.post('/auth/register',validate(createUserModel), createUserController)


export default router;