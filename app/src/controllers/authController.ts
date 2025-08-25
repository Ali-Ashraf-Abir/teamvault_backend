import { Request, Response, Router } from "express";
import { createUserService } from "../services/authServices";
import { validate } from "../utils/validation";
import { fail } from "../utils/http";


const createUserController = async (req: Request, res: Response) => {

    const userData = req.body

    const result = await createUserService(userData)
    if(!result.ok){
        return fail(res,result.message,'Email is already in use')
    }
    console.log(result)
    return res.json({message:"Registration Successfull"});

};

export {createUserController};