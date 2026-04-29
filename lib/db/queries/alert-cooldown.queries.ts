import { db, DrizzleTx } from '@/lib/db'
import { alertCooldowns } from '@/lib/db/schema'
import type { AlertCooldown } from '@/lib/db/schema'
import { eq, and, gt } from 'drizzle-orm'

// USED BY: [alert.service] — count: 1

export async function findActiveCooldown(
  alertType: string,
  entityId: string,
  cooldownHours: number,
  tx?: DrizzleTx
): Promise<AlertCooldown | null> {
  const executor = tx ?? db
  const cutoff = new Date(Date.now() - cooldownHours * 60 * 60 * 1000)
  const [row] = await executor
    .select()
    .from(alertCooldowns)
    .where(
      and(
        eq(alertCooldowns.alertType, alertType),
        eq(alertCooldowns.entityId, entityId),
        gt(alertCooldowns.lastSentAt, cutoff)
      )
    )
    .limit(1)
  return row ?? null
}

export async function upsertCooldown(
  alertType: string,
  entityType: string,
  entityId: string,
  tx?: DrizzleTx
): Promise<void> {
  const executor = tx ?? db
  const now = new Date()
  await executor
    .insert(alertCooldowns)
    .values({ alertType, entityType, entityId, lastSentAt: now })
    .onConflictDoUpdate({
      target: [alertCooldowns.alertType, alertCooldowns.entityId],
      set: { lastSentAt: now },
    })
}
