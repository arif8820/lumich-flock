import { db } from '@/lib/db'
import { flockPhases } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { FlockPhase, NewFlockPhase } from '@/lib/db/schema'

export async function findAllFlockPhases(): Promise<FlockPhase[]> {
  return db.select().from(flockPhases).orderBy(asc(flockPhases.sortOrder))
}

export async function insertFlockPhase(data: NewFlockPhase): Promise<FlockPhase> {
  const [phase] = await db.insert(flockPhases).values(data).returning()
  return phase!
}

export async function updateFlockPhase(id: string, data: Partial<NewFlockPhase>): Promise<FlockPhase | null> {
  const [phase] = await db.update(flockPhases).set(data).where(eq(flockPhases.id, id)).returning()
  return phase ?? null
}

export async function deleteFlockPhase(id: string): Promise<void> {
  await db.delete(flockPhases).where(eq(flockPhases.id, id))
}
