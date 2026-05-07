import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and } from 'drizzle-orm'

export async function findAssignmentsByUser(farmSchema: string, userId: string) {
  const { userCoopAssignments, coops } = getFarmSchema(farmSchema)
  const result = await db
    .select({ assignment: userCoopAssignments, coopName: coops.name })
    .from(userCoopAssignments)
    .innerJoin(coops, eq(userCoopAssignments.coopId, coops.id))
    .where(eq(userCoopAssignments.userId, userId))

  return result.map(({ assignment, coopName }) => ({ ...assignment, coopName }))
}

export async function findAssignedCoopIds(farmSchema: string, userId: string): Promise<string[]> {
  const { userCoopAssignments } = getFarmSchema(farmSchema)
  const result = await db
    .select({ coopId: userCoopAssignments.coopId })
    .from(userCoopAssignments)
    .where(eq(userCoopAssignments.userId, userId))

  return result.map((r) => r.coopId)
}

export async function insertAssignment(farmSchema: string, userId: string, coopId: string) {
  const { userCoopAssignments } = getFarmSchema(farmSchema)
  const [assignment] = await db
    .insert(userCoopAssignments)
    .values({ userId, coopId })
    .onConflictDoNothing()
    .returning()
  return assignment!
}

export async function deleteAssignment(farmSchema: string, userId: string, coopId: string): Promise<void> {
  const { userCoopAssignments } = getFarmSchema(farmSchema)
  await db
    .delete(userCoopAssignments)
    .where(and(eq(userCoopAssignments.userId, userId), eq(userCoopAssignments.coopId, coopId)))
}
