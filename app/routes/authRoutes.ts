// import { Request, Response, Router } from "express";
// import { z } from "zod";
// import bcrypt from "bcrypt";
// import { prisma } from "../db/prisma";

// const router = Router();

// const createUserSchema = z.object({
//     email: z.string().email(),
//     password: z.string().min(8),           // adjust policy as needed
//     first_name: z.string().min(1).max(80),
//     last_name: z.string().min(1).max(80),
// });

// const insertUser = async (password: any, email: any, first_name: any, last_name: any) => {

//     // create the user
//     const user = await prisma.user.create({
//         data: { email, password, first_name, last_name },
//         select: { id: true, email: true, first_name: true }, // never return passwordHash
//     });

//     return user;

// }

// const controller = async (req: Request, res: Response) => {
//     const users = await prisma.user.findMany();

//     return res.json(users);
// };

// const postController = async (req: Request, res: Response) => {
//     const parse = createUserSchema.safeParse(req.body);
//     if (!parse.success) {
//         return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
//     }

//     const { email, password, first_name, last_name } = parse.data;

//     const user = await insertUser(password, email, first_name, last_name)

//     return res.json(user);
// };

// router.route('/test').get(controller).post(postController).put(controller).delete(controller)
// // POST /api/users
// router.post("/", async (req, res) => {
//     console.log(req.body)
//     const parse = createUserSchema.safeParse(req.body);
//     if (!parse.success) {
//         return res.status(400).json({ error: "Invalid input", details: parse.error.flatten() });
//     }

//     const { email, password, first_name, last_name } = parse.data;

//     try {
//         // hash password
//         const passwordHash = await bcrypt.hash(password, 12);

//         // create the user
//         const user = await prisma.user.create({
//             data: { email, password, first_name, last_name },
//             select: { id: true, email: true, first_name: true }, // never return passwordHash
//         });

//         return res.status(201).json(user);
//     } catch (err: any) {
//         // Handle unique constraint violation on email
//         if (err.code === "P2002" && err.meta?.target?.includes("email")) {
//             return res.status(409).json({ error: "Email already in use" });
//         }
//         console.error(err);
//         return res.status(500).json({ error: "Failed to create user" });
//     }
// });



// export default router;
