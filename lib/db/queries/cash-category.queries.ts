import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'

export async function listCategories(farmSchema: string) {
  const { cashCategories } = getFarmSchema(farmSchema)
  return db.select().from(cashCategories).orderBy(cashCategories.name)
}

export async function listActiveCategories(farmSchema: string, type?: 'in' | 'out' | 'both') {
  const { cashCategories } = getFarmSchema(farmSchema)
  const rows = await db.select().from(cashCategories).where(eq(cashCategories.isActive, true))
  if (!type) return rows
  return rows.filter(r => r.type === type || r.type === 'both')
}

export async function findCategoryById(farmSchema: string, id: string) {
  const { cashCategories } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(cashCategories).where(eq(cashCategories.id, id)).limit(1)
  return row ?? null
}

export async function createCategory(farmSchema: string, input: { name: string; type: 'in' | 'out' | 'both' }) {
  const { cashCategories } = getFarmSchema(farmSchema)
  const [row] = await db.insert(cashCategories).values(input).returning()
  return row!
}

export async function updateCategory(farmSchema: string, id: string, input: { name?: string; type?: 'in' | 'out' | 'both'; isActive?: boolean }) {
  const { cashCategories } = getFarmSchema(farmSchema)
  const [row] = await db.update(cashCategories).set(input).where(eq(cashCategories.id, id)).returning()
  return row ?? null
}
