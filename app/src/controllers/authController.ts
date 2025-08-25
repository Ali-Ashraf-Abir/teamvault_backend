import { Request, Response, Router } from "express";
import { createUserService } from "../services/authServices";
import { validate } from "../utils/validation";


const createUserController = async (req: Request, res: Response) => {

    const userData = req.body

    const result = await createUserService(userData)
    if(!result.ok){
        res.status(400).json({"error":result.code})
    }
    console.log(result)
    return res.json({message:"Registration Successfull"});

};

export {createUserController};