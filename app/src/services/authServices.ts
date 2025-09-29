import { prisma } from "../../db/prisma";
import { hashPassword } from '../utils/hash'; // your argon2/bcrypt wrapper
import type { CreateUserDTO, LoginUserDTO } from "../models/User"; // from your Zod schema
import argon2 from "argon2";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/generateToken";
import { Response } from "express";
import { setRefreshCookie } from "../utils/setRefreshToken";

export async function createUserService(input: CreateUserDTO) {

  const existUser = await prisma.user.findUnique({ where: { email: input.email } })
  if (existUser) {
    return { ok: false as const, message: "Email Taken" };
  }
  const passwordHash = await hashPassword(input.password);


  try {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: passwordHash,
        firstName: input.first_name,
        lastName: input.last_name,
      },
      select: { userId: true, email: true, firstName: true, lastName: true }, // never return hashes
    });
    return { ok: true as const, user };
  } catch (e: any) {
    throw e; // let controller handle unexpected errors
  }
}

export async function loginUserService(data: LoginUserDTO) {
  const { email, password } = data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return { ok: false as const, message: "User not found" };
  }

  const verifiedPass = await argon2.verify(user.passwordHash, password)
  if (verifiedPass) {
    return { ok: true as const, messge: 'valid user', id: user.userId, tokenVersion: user.tokenVersion };
  }
  return { ok: false as const, message: "Invalid Password" };

}


export async function refreshTokenService(rtCookie:string) {
  try {
    const payload = verifyRefreshToken(rtCookie);
    const user = await prisma.user.findUnique({ where: { userId: payload.userId } });
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return { ok: false, message: "Refresh token invalid" ,accessToken:'',refreshToken:'' };
    }

    const newAT = signAccessToken({ userId: user.userId });
    const newRT = signRefreshToken({ userId: user.userId, tokenVersion: user.tokenVersion }); // rotate
   
    return { ok: true, accessToken: newAT ,refreshToken:newRT,message:'refresh token valid' };

  } catch {
    return { ok: false, message: "Refresh token expired/invalid",accessToken:'',refreshToken:'' }
   
  }
}


export async function logoutService(token:string){
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { userId: payload.userId } });
    if (!user) return { ok: false, message: "User not found" };
    await prisma.user.update({ where: { userId: user.userId }, data: { tokenVersion: user.tokenVersion + 1 } });
    return { ok: true, message: "Logout successful" };
  } catch {
    return { ok: false, message: "Refresh token expired/invalid" };
  }
}