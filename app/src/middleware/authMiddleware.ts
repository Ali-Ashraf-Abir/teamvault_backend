import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/generateToken";


export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ ok: false, error: "Missing token" });

  const token = auth.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    (req as any).userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}
