import { Router } from "express"
import { getUserByIdController } from "../controllers/userController"


const router = Router()

router.get('/user/:id', getUserByIdController)


export default router