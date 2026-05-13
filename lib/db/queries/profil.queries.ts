import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'

export async function getUserProfil(farmSchema: string, userId: string) {
  const { users } = getFarmSchema(farmSchema)
  const [user] = await db
    .select({ fullName: users.fullName, phone: users.phone })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  return user ?? null
}

export async function updateUserProfil(
  farmSchema: string,
  userId: string,
  data: { fullName: string; phone: string | null }
) {
  const { users } = getFarmSchema(farmSchema)
  const [updated] = await db
    .update(users)
    .set({ fullName: data.fullName, phone: data.phone })
    .where(eq(users.id, userId))
    .returning({ fullName: users.fullName, phone: users.phone })
  return updated ?? null
}
