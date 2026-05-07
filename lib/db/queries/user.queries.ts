import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'

export async function findAllUsers(farmSchema: string) {
  const { users } = getFarmSchema(farmSchema)
  return db.select().from(users).orderBy(users.fullName)
}

export async function findUserById(farmSchema: string, id: string) {
  const { users } = getFarmSchema(farmSchema)
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function insertUser(farmSchema: string, data: any) {
  const { users } = getFarmSchema(farmSchema)
  const [user] = await db.insert(users).values(data).returning()
  return user!
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUser(farmSchema: string, id: string, data: any) {
  const { users } = getFarmSchema(farmSchema)
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning()
  return user ?? null
}
