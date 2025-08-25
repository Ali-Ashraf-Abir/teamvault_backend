import { z } from "zod";

export const createUserModel = z.object({
  email: z.preprocess(
    v => typeof v === "string" ? v.trim().toLowerCase() : v,
    z.string().email("Invalid email format")
  ),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    // optional: at least one letter and one digit
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Include letters and numbers"),
  first_name: z.preprocess(
    v => typeof v === "string" ? v.trim() : v,
    z.string().min(1, "First name required").max(80)
  ),
  last_name: z.preprocess(
    v => typeof v === "string" ? v.trim() : v,
    z.string().min(1, "Last name required").max(80)
  ),
});
export type CreateUserDTO = z.infer<typeof createUserModel>;
