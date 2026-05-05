import { db } from '@/lib/db'
import { flockDeliveries } from '@/lib/db/schema'
import { eq, sum } from 'drizzle-orm'
import type { FlockDelivery, NewFlockDelivery } from '@/lib/db/schema'

export async function insertFlockDelivery(data: NewFlockDelivery): Promise<FlockDelivery> {
  const [delivery] = await db.insert(flockDeliveries).values(data).returning()
  return delivery!
}

export async function findDeliveriesByFlockId(flockId: string): Promise<FlockDelivery[]> {
  return db.select().from(flockDeliveries).where(eq(flockDeliveries.flockId, flockId))
}

export async function sumDeliveriesQuantityByFlockId(flockId: string): Promise<number> {
  const [result] = await db
    .select({ total: sum(flockDeliveries.quantity) })
    .from(flockDeliveries)
    .where(eq(flockDeliveries.flockId, flockId))
  return Number(result?.total ?? 0)
}
