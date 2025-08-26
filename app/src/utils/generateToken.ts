import jwt from "jsonwebtoken";

export function signAccessToken(payload: { userId: string }) {
  return jwt.sign(payload, process.env.JWT_AT_SECRET!, { expiresIn: "15m" });
}

export function signRefreshToken(payload: { userId: string; tokenVersion: number }) {
  return jwt.sign(payload, process.env.JWT_RT_SECRET!, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, process.env.JWT_AT_SECRET!) as { userId: string; iat: number; exp: number };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, process.env.JWT_RT_SECRET!) as { userId: string; tokenVersion: number; iat: number; exp: number };
}
