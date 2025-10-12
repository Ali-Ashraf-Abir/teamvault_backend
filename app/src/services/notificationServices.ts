import { prisma } from "../../db/prisma";


export type NotificationFilter = {
  recipientId: string;
  serverId?: string;
  lobbyId?: string;
  chatId?: string;
  limit?: number;
  cursor?: string; // notificationId for pagination
};

// Fetch notifications with optional filters
export async function getNotifications({
  recipientId,
  serverId,
  lobbyId,
  chatId,
  limit = 15,
  cursor,
}: NotificationFilter) {
  const where: any = { recipientId };
  if (serverId) where.serverId = serverId;
  if (lobbyId) where.lobbyId = lobbyId;
  if (chatId) where.chatId = chatId;

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    ...(cursor && { skip: 1, cursor: { notificationId: cursor } }),
    include: {
      sender: { select: { firstName: true, lastName: true } },
      server: { select: { serverName: true } },
      lobby: { select: { lobbyName: true } },
    },
  });

  return notifications;
}

// Mark notifications as read
export async function markNotificationsAsRead(recipientId: string, serverId?: string, lobbyId?: string) {
  const where: any = { recipientId, isRead: false };
  if (serverId) where.serverId = serverId;
  if (lobbyId) where.lobbyId = lobbyId;

  const result = await prisma.notification.updateMany({
    where,
    data: { isRead: true },
  });

  return result;
}
