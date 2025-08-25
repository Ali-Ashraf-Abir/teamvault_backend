// src/middleware/error.ts
import { fail } from "../utils/http";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/HttpError"; // optional

export function errorHandler(err: any, req: any, res: any, next: any) {
  if (res.headersSent) return next(err);

  // Body parser / malformed JSON
  // (Express sets err.type === 'entity.parse.failed' for bad JSON)
  if (err?.type === "entity.parse.failed" || err instanceof SyntaxError) {
    return fail(res, "BAD_JSON", "Malformed JSON body", 400);
  }

  // Zod validation (if any slipped through middleware)
  if (err instanceof ZodError) {
    const details = err.issues.map(i => ({ path: i.path.join("."), message: i.message }));
    return fail(res, "VALIDATION_ERROR", "Invalid input", 400, details);
  }

  // Your own thrown errors
  if (err instanceof HttpError) {
    return fail(res, err.code, err.message, err.status, err.details);
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // unique constraint
        return fail(res, "UNIQUE_VIOLATION", "Duplicate value", 409, { target: err.meta?.target });
      case "P2025": // record not found
        return fail(res, "NOT_FOUND", "Record not found", 404);
      case "P2003": // FK constraint failed
        return fail(res, "FK_CONFLICT", "Related record missing or protected", 409);
      default:
        return fail(res, "DB_ERROR", "Database error", 500, { code: err.code, meta: err.meta });
    }
  }

  // Prisma validation (bad query shape)
  if (err instanceof Prisma.PrismaClientValidationError) {
    return fail(res, "DB_VALIDATION", "Invalid database query", 400);
  }

  // JWT errors
  if (err instanceof jwt.TokenExpiredError) {
    return fail(res, "TOKEN_EXPIRED", "Access token expired", 401);
  }
  if (err instanceof jwt.NotBeforeError || err instanceof jwt.JsonWebTokenError) {
    return fail(res, "INVALID_TOKEN", "Invalid access token", 401);
  }

  // Fallback: unknown error
  console.error(err);
  return fail(res, "SERVER_ERROR", "Something went wrong", 500);
}
