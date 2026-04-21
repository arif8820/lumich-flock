import { createSupabaseServerClient } from './server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { User } from '@/lib/db/schema'

export type SessionUser = User

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!dbUser || !dbUser.isActive) return null
  return dbUser
}
