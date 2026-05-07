import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, isNull, and } from 'drizzle-orm'

export async function findAllActiveFlocks(farmSchema: string) {
  const { flocks, coops } = getFarmSchema(farmSchema)
  const result = await db
    .select({ flock: flocks, coopName: coops.name })
    .from(flocks)
    .innerJoin(coops, eq(flocks.coopId, coops.id))
    .where(isNull(flocks.retiredAt))
    .orderBy(flocks.arrivalDate)

  return result.map(({ flock, coopName }) => ({ ...flock, coopName }))
}

export async function findFlockById(farmSchema: string, id: string) {
  const { flocks } = getFarmSchema(farmSchema)
  const [flock] = await db.select().from(flocks).where(eq(flocks.id, id)).limit(1)
  return flock ?? null
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertFlock(farmSchema: string, data: any) {
  const { flocks } = getFarmSchema(farmSchema)
  const [flock] = await db.insert(flocks).values(data).returning()
  return flock!
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function updateFlock(farmSchema: string, id: string, data: any) {
  const { flocks } = getFarmSchema(farmSchema)
  const [flock] = await db.update(flocks).set(data).where(eq(flocks.id, id)).returning()
  return flock ?? null
}

export async function findActiveFlockByCoopId(farmSchema: string, coopId: string) {
  const { flocks } = getFarmSchema(farmSchema)
  const [flock] = await db
    .select()
    .from(flocks)
    .where(and(eq(flocks.coopId, coopId), isNull(flocks.retiredAt)))
    .limit(1)
  return flock ?? null
}
