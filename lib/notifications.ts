import { sql } from "./supabase"

export type Notification = {
  id: number
  user_id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export async function getNotifications(userId: number): Promise<Notification[]> {
  try {
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `
    return notifications
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

export async function getUnreadNotificationsCount(userId: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ${userId} AND is_read = false
    `
    return Number.parseInt(result[0].count)
  } catch (error) {
    console.error("Error getting unread notifications count:", error)
    return 0
  }
}

export async function markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
  try {
    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE id = ${notificationId} AND user_id = ${userId}
    `
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  try {
    await sql`
      UPDATE notifications
      SET is_read = true
      WHERE user_id = ${userId}
    `
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
  }
}

export async function createNotification(userId: number, title: string, message: string): Promise<Notification> {
  try {
    const [notification] = await sql`
      INSERT INTO notifications (user_id, title, message, is_read, created_at)
      VALUES (${userId}, ${title}, ${message}, false, NOW())
      RETURNING *
    `
    return notification
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export async function deleteNotification(notificationId: number, userId: number): Promise<void> {
  try {
    await sql`
      DELETE FROM notifications
      WHERE id = ${notificationId} AND user_id = ${userId}
    `
  } catch (error) {
    console.error("Error deleting notification:", error)
  }
}

