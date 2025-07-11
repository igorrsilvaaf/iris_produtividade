import prisma from "./prisma"

export type Notification = {
  id: number
  user_id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export async function getNotifications(userId: number): Promise<Notification[]> {
  const notifications = await prisma.notifications.findMany({
    where: {
      user_id: userId
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return notifications.map(n => ({
    ...n,
    created_at: n.created_at?.toISOString() || new Date().toISOString(),
    is_read: n.is_read || false
  }));
}

export async function markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
  await prisma.notifications.updateMany({
    where: {
      id: notificationId,
      user_id: userId
    },
    data: {
      is_read: true
    }
  });
}

export async function createNotification(
  userId: number,
  title: string,
  message: string,
): Promise<void> {
  await prisma.notifications.create({
    data: {
      user_id: userId,
      title,
      message,
      is_read: false
    }
  });
}

export async function deleteNotification(notificationId: number, userId: number): Promise<void> {
  await prisma.notifications.deleteMany({
    where: {
      id: notificationId,
      user_id: userId
    }
  });
}

export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const count = await prisma.notifications.count({
    where: {
      user_id: userId,
      is_read: false
    }
  });

  return count;
}

