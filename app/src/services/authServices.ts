import { prisma } from "../../db/prisma";
import { hashPassword } from '../utils/hash'; // your argon2/bcrypt wrapper
import type { CreateUserDTO } from "../models/User"; // from your Zod schema

export async function createUserService(input: CreateUserDTO) {
const passwordHash = await hashPassword(input.password);

try {
 const user = await prisma.user.create({
   data: {
     email: input.email,
     password:passwordHash,
     first_name: input.first_name,
     last_name: input.last_name,
   },
   select: { id: true, email: true,first_name:true,last_name:true }, // never return hashes
 });
 return { ok: true as const, user };
} catch (e: any) {
 if (e.code === "P2002") {
   // Unique constraint violation on email
   return { ok: false as const, code: "EMAIL_TAKEN" };
 }
 throw e; // let controller handle unexpected errors
}
}