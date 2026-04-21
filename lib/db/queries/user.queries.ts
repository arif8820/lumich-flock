import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { NewUser, User } from '@/lib/db/schema'

export async function findAllUsers(): Promise<User[]> {
  return db.select().from(users).orderBy(users.fullName)
}

export async function findUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

export async function insertUser(data: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(data).returning()
  return user!
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | null> {
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning()
  return user ?? null
}
