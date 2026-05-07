import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, gt } from 'drizzle-orm'

// USED BY: [alert.service] — count: 1

export async function findActiveCooldown(
  farmSchema: string,
  alertType: string,
  entityId: string,
  cooldownHours: number,
  tx?: DrizzleTx
): Promise<{ id: string; alertType: string; entityType: string; entityId: string; lastSentAt: Date } | null> {
  const { alertCooldowns } = getFarmSchema(farmSchema)
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
  farmSchema: string,
  alertType: string,
  entityType: string,
  entityId: string,
  tx?: DrizzleTx
): Promise<void> {
  const { alertCooldowns } = getFarmSchema(farmSchema)
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
