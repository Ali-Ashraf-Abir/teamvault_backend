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


export const getServerService = async (id: string) => {

  try {
    const data = await prisma.server.findUnique({
      where: { serverId: id },
      include:{
        members:{
          include:{
            user:true,
          }
        }
      }
    });

    if (!data) {
      return { ok: false as const, message: "server not found" };
    }

    return { ok: true as const, data };
  } catch (error) {
    console.error("Error fetching server:", error);
    return { ok: false as const, message: "internal error" };
  }
};


export async function getServersByUserService(userId: string) {
  try {
    // Find all servers where the user is a member or creator
    const servers = await prisma.server.findMany({
      where: {
        OR: [
          { createdBy: userId }, // user is the owner
          { members: { some: { userId } } }, // user is a member
        ],
      },
      include: {
        creator: { select: { userId: true, firstName: true, lastName: true } },
        members: { select: { userId: true } },
        inviteLinks: true,
        userInvites: { where: { invitedUserId: userId } }, // invites for this user
      },
    });

    // Map to include owner boolean
    const result = servers.map((server) => ({
      ...server,
      owner: server.createdBy === userId,
    }));

    return { ok: true as const, servers: result };
  } catch (error: any) {
    console.error(error);
    return { ok: false as const, message: "Failed to fetch servers" };
  }
}