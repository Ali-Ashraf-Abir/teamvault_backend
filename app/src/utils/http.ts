
import type { Response } from "express";

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function fail(
  res: Response,
  code: string,
  message: string,
  status = 400,
  details?: unknown
) {
  return res.status(status).json({ ok: false, error: { code, message, details } });
}

// optional: async wrapper
export const asyncH =
  (fn: any) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);
