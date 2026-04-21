import { db } from '@/lib/db'
import { userCoopAssignments, coops } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { UserCoopAssignment } from '@/lib/db/schema'

export async function findAssignmentsByUser(userId: string): Promise<(UserCoopAssignment & { coopName: string })[]> {
  const result = await db
    .select({ assignment: userCoopAssignments, coopName: coops.name })
    .from(userCoopAssignments)
    .innerJoin(coops, eq(userCoopAssignments.coopId, coops.id))
    .where(eq(userCoopAssignments.userId, userId))

  return result.map(({ assignment, coopName }) => ({ ...assignment, coopName }))
}

export async function findAssignedCoopIds(userId: string): Promise<string[]> {
  const result = await db
    .select({ coopId: userCoopAssignments.coopId })
    .from(userCoopAssignments)
    .where(eq(userCoopAssignments.userId, userId))

  return result.map((r) => r.coopId)
}

export async function insertAssignment(userId: string, coopId: string): Promise<UserCoopAssignment> {
  const [assignment] = await db
    .insert(userCoopAssignments)
    .values({ userId, coopId })
    .onConflictDoNothing()
    .returning()
  return assignment!
}

export async function deleteAssignment(userId: string, coopId: string): Promise<void> {
  await db
    .delete(userCoopAssignments)
    .where(and(eq(userCoopAssignments.userId, userId), eq(userCoopAssignments.coopId, coopId)))
}
