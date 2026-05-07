import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sum } from 'drizzle-orm'

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertFlockDelivery(farmSchema: string, data: any) {
  const { flockDeliveries } = getFarmSchema(farmSchema)
  const [delivery] = await db.insert(flockDeliveries).values(data).returning()
  return delivery!
}

export async function findDeliveriesByFlockId(farmSchema: string, flockId: string) {
  const { flockDeliveries } = getFarmSchema(farmSchema)
  return db.select().from(flockDeliveries).where(eq(flockDeliveries.flockId, flockId))
}

export async function sumDeliveriesQuantityByFlockId(farmSchema: string, flockId: string): Promise<number> {
  const { flockDeliveries } = getFarmSchema(farmSchema)
  const [result] = await db
    .select({ total: sum(flockDeliveries.quantity) })
    .from(flockDeliveries)
    .where(eq(flockDeliveries.flockId, flockId))
  return Number(result?.total ?? 0)
}
