import { Router } from "express"
import { getUserByEmailController, getUserByIdController } from "../controllers/userController"


const router = Router()

router.get('/user/:id', getUserByIdController)
router.get('/user/email/:email', getUserByEmailController)


export default router