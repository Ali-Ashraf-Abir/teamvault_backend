import type { Request, Response } from "express";
export function setRefreshCookie(res: Response, rt: string) {
  res.cookie("rt", rt, {
    httpOnly: true,
    secure: true,         // true in production
    sameSite: "strict",
    path: "/auth/refresh" // cookie sent only to refresh endpoint
    // maxAge is taken from JWT exp; setting a cookie maxAge is optional
  });
}