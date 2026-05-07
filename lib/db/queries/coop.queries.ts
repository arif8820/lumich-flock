import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'

export async function findAllCoops(farmSchema: string) {
  const { coops } = getFarmSchema(farmSchema)
  return db.select().from(coops).orderBy(coops.name)
}

export async function findCoopById(farmSchema: string, id: string) {
  const { coops } = getFarmSchema(farmSchema)
  const [coop] = await db.select().from(coops).where(eq(coops.id, id)).limit(1)
  return coop ?? null
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertCoop(farmSchema: string, data: any) {
  const { coops } = getFarmSchema(farmSchema)
  const [coop] = await db.insert(coops).values(data).returning()
  return coop!
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function updateCoop(farmSchema: string, id: string, data: any) {
  const { coops } = getFarmSchema(farmSchema)
  const [coop] = await db.update(coops).set(data).where(eq(coops.id, id)).returning()
  return coop ?? null
}

export async function deleteCoop(farmSchema: string, id: string): Promise<void> {
  const { coops } = getFarmSchema(farmSchema)
  await db.delete(coops).where(eq(coops.id, id))
}
