import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, not, inArray, sql, desc } from 'drizzle-orm'

// USED BY: [notification.service, alert.service] — count: 2

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function createNotification(
  farmSchema: string,
  notification: any,
  tx?: DrizzleTx
) {
  const { notifications } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  const [row] = await executor.insert(notifications).values(notification).returning()
  return row!
}

export async function listNotificationsForRole(
  farmSchema: string,
  role: 'operator' | 'supervisor' | 'admin',
  limit = 50
) {
  const { notifications } = getFarmSchema(farmSchema)
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
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<number> {
  const { notifications, notificationReads } = getFarmSchema(farmSchema)
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
  farmSchema: string,
  notificationId: string,
  userId: string
): Promise<void> {
  const { notificationReads } = getFarmSchema(farmSchema)
  await db
    .insert(notificationReads)
    .values({ notificationId, userId })
    .onConflictDoNothing()
}

export async function markAllReadForUser(
  farmSchema: string,
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<void> {
  const { notificationReads } = getFarmSchema(farmSchema)
  const visibleNotifications = await listNotificationsForRole(farmSchema, role, 500)
  if (visibleNotifications.length === 0) return

  const values = visibleNotifications.map((n) => ({ notificationId: n.id, userId }))
  await db.insert(notificationReads).values(values).onConflictDoNothing()
}

export async function getReadNotificationIdsForUser(
  farmSchema: string,
  userId: string
): Promise<{ notificationId: string }[]> {
  const { notificationReads } = getFarmSchema(farmSchema)
  return db
    .select({ notificationId: notificationReads.notificationId })
    .from(notificationReads)
    .where(eq(notificationReads.userId, userId))
}
