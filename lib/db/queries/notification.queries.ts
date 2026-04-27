import { db, DrizzleTx } from '@/lib/db'
import { notifications, notificationReads } from '@/lib/db/schema'
import type { NewNotification, Notification } from '@/lib/db/schema'
import { eq, and, not, inArray, sql, desc } from 'drizzle-orm'

// USED BY: [notification.service, alert.service] — count: 2
export async function createNotification(
  notification: NewNotification,
  tx?: DrizzleTx
): Promise<Notification> {
  const executor = tx ?? db
  const [row] = await executor.insert(notifications).values(notification).returning()
  return row!
}

export async function listNotificationsForRole(
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
): Promise<Notification[]> {
  return db
    .select()
    .from(notifications)
    .where(
      sql`${notifications.targetRole} IN ('all', ${role})`
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
}

export async function countUnreadForUser(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number> {
  // Get all notification IDs already read by the user
  const readRows = await db
    .select({ notificationId: notificationReads.notificationId })
    .from(notificationReads)
    .where(eq(notificationReads.userId, userId))

  const readIds = readRows.map((r) => r.notificationId)

  const baseQuery = db
    .select({ count: sql<string>`COUNT(*)` })
    .from(notifications)
    .where(
      sql`${notifications.targetRole} IN ('all', ${role})`
    )

  if (readIds.length === 0) {
    const [row] = await baseQuery
    return Number(row?.count ?? 0)
  }

  const [row] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(notifications)
    .where(
      and(
        sql`${notifications.targetRole} IN ('all', ${role})`,
        not(inArray(notifications.id, readIds))
      )
    )
  return Number(row?.count ?? 0)
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  await db
    .insert(notificationReads)
    .values({ notificationId, userId })
    .onConflictDoNothing()
}

export async function markAllReadForUser(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void> {
  const visibleNotifications = await listNotificationsForRole(role, 500)
  if (visibleNotifications.length === 0) return

  const values = visibleNotifications.map((n) => ({ notificationId: n.id, userId }))
  await db.insert(notificationReads).values(values).onConflictDoNothing()
}
