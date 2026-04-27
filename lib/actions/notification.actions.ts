'use server'

import { getSession } from '@/lib/auth/get-session'
import {
  getNotificationsForRole,
  getUnreadCount,
  readNotification,
  readAllNotifications,
} from '@/lib/services/notification.service'
import type { Notification } from '@/lib/services/notification.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getNotificationsAction(): Promise<ActionResult<Notification[]>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const data = await getNotificationsForRole(session.role)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat notifikasi' }
  }
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const count = await getUnreadCount(session.id, session.role)
    return { success: true, data: count }
  } catch {
    return { success: false, error: 'Gagal memuat jumlah notifikasi belum dibaca' }
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await readNotification(notificationId, session.id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menandai notifikasi sebagai dibaca' }
  }
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await readAllNotifications(session.id, session.role)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menandai semua notifikasi sebagai dibaca' }
  }
}
