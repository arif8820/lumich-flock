import { db } from '@/lib/db'
import { flocks, coops } from '@/lib/db/schema'
import { eq, isNull } from 'drizzle-orm'
import type { Flock, NewFlock } from '@/lib/db/schema'

export async function findAllActiveFlocks(): Promise<(Flock & { coopName: string })[]> {
  const result = await db
    .select({ flock: flocks, coopName: coops.name })
    .from(flocks)
    .innerJoin(coops, eq(flocks.coopId, coops.id))
    .where(isNull(flocks.retiredAt))
    .orderBy(flocks.arrivalDate)

  return result.map(({ flock, coopName }) => ({ ...flock, coopName }))
}

export async function findFlockById(id: string): Promise<Flock | null> {
  const [flock] = await db.select().from(flocks).where(eq(flocks.id, id)).limit(1)
  return flock ?? null
}

export async function insertFlock(data: NewFlock): Promise<Flock> {
  const [flock] = await db.insert(flocks).values(data).returning()
  return flock!
}

export async function updateFlock(id: string, data: Partial<NewFlock>): Promise<Flock | null> {
  const [flock] = await db.update(flocks).set(data).where(eq(flocks.id, id)).returning()
  return flock ?? null
}
