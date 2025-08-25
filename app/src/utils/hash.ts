// src/lib/hash.ts
import argon2 from "argon2";
export const hashPassword = (pwd: string) => argon2.hash(pwd, { type: argon2.argon2id });
export const verifyPassword = (hash: string, pwd: string) => argon2.verify(hash, pwd);
