import { db } from '@/lib/db'
import { coops } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Coop, NewCoop } from '@/lib/db/schema'

export async function findAllCoops(): Promise<Coop[]> {
  return db.select().from(coops).orderBy(coops.name)
}

export async function findCoopById(id: string): Promise<Coop | null> {
  const [coop] = await db.select().from(coops).where(eq(coops.id, id)).limit(1)
  return coop ?? null
}

export async function insertCoop(data: NewCoop): Promise<Coop> {
  const [coop] = await db.insert(coops).values(data).returning()
  return coop!
}

export async function updateCoop(id: string, data: Partial<NewCoop>): Promise<Coop | null> {
  const [coop] = await db.update(coops).set(data).where(eq(coops.id, id)).returning()
  return coop ?? null
}

export async function deleteCoop(id: string): Promise<void> {
  await db.delete(coops).where(eq(coops.id, id))
}
