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
  farmSchema: string,
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
): Promise<Notification[]> {
  return listNotificationsForRole(farmSchema, role, limit)
}

export async function getUnreadCount(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number> {
  return countUnreadForUser(farmSchema, userId, role)
}

export async function readNotification(
  farmSchema: string,
  notificationId: string,
  userId: string
): Promise<void> {
  await markNotificationRead(farmSchema, notificationId, userId)
}

export async function readAllNotifications(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void> {
  await markAllReadForUser(farmSchema, userId, role)
}

export async function pushNotification(
  farmSchema: string,
  data: NewNotification
): Promise<Notification> {
  return createNotification(farmSchema, data)
}

export async function getReadNotificationIds(farmSchema: string, userId: string): Promise<string[]> {
  const rows = await getReadNotificationIdsForUser(farmSchema, userId)
  return rows.map((r) => r.notificationId)
}
