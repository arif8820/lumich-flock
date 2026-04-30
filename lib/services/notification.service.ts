import {
  createNotification,
  listNotificationsForRole,
  countUnreadForUser,
  markNotificationRead,
  markAllReadForUser,
  getReadNotificationIdsForUser,
} from '@/lib/db/queries/notification.queries'
import type { Notification, NewNotification } from '@/lib/db/schema'

export type { Notification }

export async function getNotificationsForRole(
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
): Promise<Notification[]> {
  return listNotificationsForRole(role, limit)
}

export async function getUnreadCount(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number> {
  return countUnreadForUser(userId, role)
}

export async function readNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  await markNotificationRead(notificationId, userId)
}

export async function readAllNotifications(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void> {
  await markAllReadForUser(userId, role)
}

export async function pushNotification(
  data: NewNotification
): Promise<Notification> {
  return createNotification(data)
}

export async function getReadNotificationIds(userId: string): Promise<string[]> {
  const rows = await getReadNotificationIdsForUser(userId)
  return rows.map((r) => r.notificationId)
}
