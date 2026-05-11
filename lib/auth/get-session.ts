import { createSupabaseServerClient } from './server'
import { db } from '@/lib/db'
import { farmUsers, farms } from '@/lib/db/schema'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import type { User } from '@/lib/db/schema'

export type SessionUser = User & { farmSchema: string; farmName: string }

function getCachedSession(userId: string, email: string) {
  return unstable_cache(
    async (): Promise<SessionUser | null> => {
      // 1. Lookup farm schema from public.farm_users
      const [farmUserRow] = await db
        .select()
        .from(farmUsers)
        .where(eq(farmUsers.email, email))
        .limit(1)

      if (!farmUserRow) return null

      const { farmSchema } = farmUserRow

      // 2. Fetch DB user from farm schema + farm name in parallel
      const { users } = getFarmSchema(farmSchema)
      const [[dbUser], [farmRow]] = await Promise.all([
        db.select().from(users).where(eq(users.id, userId)).limit(1),
        db.select({ name: farms.name }).from(farms).where(eq(farms.schemaName, farmSchema)).limit(1),
      ])

      if (!dbUser || !dbUser.isActive) return null

      return { ...dbUser, farmSchema, farmName: farmRow?.name ?? farmSchema }
    },
    [`user-session-${userId}`],
    { revalidate: 60, tags: [`user-${userId}`] }
  )()
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !user.email) return null

  try {
    return await getCachedSession(user.id, user.email)
  } catch {
    return null
  }
}
