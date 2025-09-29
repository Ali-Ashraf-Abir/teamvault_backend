import { Request, Response } from "express";
import { createServerService } from "../services/serverServices";


export const createServerController = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId; // assuming you attach authenticated user to req.user
    const { name,description } = req.body;
    

    if (!name) {
      return res.status(400).json({ message: "Server name is required" });
    }

    const server = await createServerService(userId,name,description);

    res.status(201).json({
      message: "Server created successfully",
      server,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
