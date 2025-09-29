import { Request, Response, Router } from "express";

import { fail } from "../utils/http";
import { getUserByIdService } from "../services/userServices";



export async function getUserByIdController (req: Request, res: Response) {
    const id = req.params.id
    const result = await getUserByIdService(id)
    if(!result.ok){
        return fail(res, result.message, 'User not found')
    }
    res.send(result.user)
}
