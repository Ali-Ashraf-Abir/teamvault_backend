import { Router } from "express";
import { createUserController, loginUserController, logout, refresh } from "../controllers/authController";
import { validate } from "../utils/validation";
import { createUserModel,loginUserModel } from "../models/User";

const router=Router()


router.post('/auth/register',validate(createUserModel), createUserController)
router.post('/auth/login',validate(loginUserModel), loginUserController)
router.post('/auth/refresh', refresh)
router.post('/auth/logout', logout)

export default router;