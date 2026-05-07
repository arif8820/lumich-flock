import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, asc } from 'drizzle-orm'

export async function findAllFlockPhases(farmSchema: string) {
  const { flockPhases } = getFarmSchema(farmSchema)
  return db.select().from(flockPhases).orderBy(asc(flockPhases.sortOrder))
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertFlockPhase(farmSchema: string, data: any) {
  const { flockPhases } = getFarmSchema(farmSchema)
  const [phase] = await db.insert(flockPhases).values(data).returning()
  return phase!
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFlockPhase(farmSchema: string, id: string, data: any) {
  const { flockPhases } = getFarmSchema(farmSchema)
  const [phase] = await db.update(flockPhases).set(data).where(eq(flockPhases.id, id)).returning()
  return phase ?? null
}

export async function deleteFlockPhase(farmSchema: string, id: string): Promise<void> {
  const { flockPhases } = getFarmSchema(farmSchema)
  await db.delete(flockPhases).where(eq(flockPhases.id, id))
}
