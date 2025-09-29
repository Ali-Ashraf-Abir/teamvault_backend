import type { Request, Response } from "express";
export function setRefreshCookie(res: Response, rt: string) {
res.cookie("rt", rt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth/refresh",  
  });
}