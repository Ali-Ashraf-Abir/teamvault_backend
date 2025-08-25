import { NextFunction, Request, Response } from "express";
import type { ZodObject, ZodError } from "zod";

export function validate<T extends ZodObject>(
  schema: T,
  source: "body" | "query" | "params" = "body"
) {
  return (req:Request, res:Response, next:NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map(i => ({
        path: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({ error: "Validation failed", errors });
    }
    // replace with parsed, coerced, trimmed data
    req[source] = result.data;
    next();
  };
}