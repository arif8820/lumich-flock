import { createSupabaseServerClient } from './server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import type { User } from '@/lib/db/schema'

export type SessionUser = User

function getCachedDbUser(userId: string) {
  return unstable_cache(
    async () => {
      const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
      return dbUser ?? null
    },
    [`user-session-${userId}`],
    { revalidate: 60, tags: [`user-${userId}`] }
  )()
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  try {
    const dbUser = await getCachedDbUser(user.id)
    if (!dbUser || !dbUser.isActive) return null
    return dbUser
  } catch {
    return null
  }
}
