'use server'

import { getRequiredSession } from '@/lib/auth/guards'
import {
  getNotificationsForRole,
  getUnreadCount,
  readNotification,
  readAllNotifications,
} from '@/lib/services/notification.service'
import type { Notification } from '@/lib/services/notification.service'

type NotificationRole = 'operator' | 'supervisor' | 'admin'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getNotificationsAction(): Promise<ActionResult<Notification[]>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    const data = await getNotificationsForRole(session.farmSchema, session.roleSlug as NotificationRole)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat notifikasi' }
  }
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    const count = await getUnreadCount(session.farmSchema, session.id, session.roleSlug as NotificationRole)
    return { success: true, data: count }
  } catch {
    return { success: false, error: 'Gagal memuat jumlah notifikasi belum dibaca' }
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    await readNotification(session.farmSchema, notificationId, session.id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menandai notifikasi sebagai dibaca' }
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    await readAllNotifications(session.farmSchema, session.id, session.roleSlug as NotificationRole)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menandai semua notifikasi sebagai dibaca' }
  }
}
