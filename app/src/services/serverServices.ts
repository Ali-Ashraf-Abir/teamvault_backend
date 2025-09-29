import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createServerService = async (userId: string, name: string,description:string) => {
  // Create server and automatically add creator as owner
  const server = await prisma.server.create({
    data: {
      serverName:name,
      createdBy: userId,
      description,
      members: {
        create: {
          userId,
          role: "owner",
        },
      },
    },
    include: {
      members: true, // optional: return members info
    },
  });

  return server;
};

