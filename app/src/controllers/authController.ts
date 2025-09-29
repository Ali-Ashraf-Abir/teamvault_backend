import { Request, Response, Router } from "express";
import { createUserService, loginUserService, logoutService, refreshTokenService } from "../services/authServices";
import { validate } from "../utils/validation";
import { fail } from "../utils/http";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/generateToken";
import { setRefreshCookie } from "../utils/setRefreshToken";



const createUserController = async (req: Request, res: Response) => {

    const userData = req.body

    const result = await createUserService(userData)
    if (!result.ok) {
        return fail(res, result.message, 'Email is already in use')
    }
    console.log(result)
    return res.json({ message: "Registration Successfull" });

};

const loginUserController = async (req: Request, res: Response) => {

    const validUser = await loginUserService(req.body)
    if (!validUser.ok) {
        return fail(res, validUser.message, 'Invalid Credentials')
    }

    const accessToken = signAccessToken({ userId: validUser.id })
    const refreshToken = signRefreshToken({ userId: validUser.id, tokenVersion: validUser.tokenVersion })
    setRefreshCookie(res, refreshToken)
    res.send({ accessToken });
};




export async function refresh(req: Request, res: Response) {
    const rtCookie = req.cookies?.rt;
    console.log(req.cookies)
    if (!rtCookie) return res.status(400).json({ ok: false, error: "No refresh token" });
    const result = await refreshTokenService(rtCookie);

    if (!result.ok) {
        res.clearCookie("rt", { path: "/auth/refresh" });
        return fail(res, result.message, "Refresh token expired/invalid");
    } 

     setRefreshCookie(res, result.refreshToken);
     res.send({ accessToken: result.accessToken });

}


export async function logout(req: Request, res: Response) {
    const token = req.body.token
    const result = await logoutService(token)
    res.clearCookie("rt", { path: "/auth/refresh" });
    return res.sendStatus(200);
}

export { createUserController, loginUserController };