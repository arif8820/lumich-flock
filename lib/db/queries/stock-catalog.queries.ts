import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and } from 'drizzle-orm'

export async function findAllCategories(farmSchema: string) {
  const { stockCategories } = getFarmSchema(farmSchema)
  return db.select().from(stockCategories)
}

export async function findCategoryById(farmSchema: string, id: string) {
  const { stockCategories } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(stockCategories).where(eq(stockCategories.id, id)).limit(1)
  return row ?? null
}

export async function findCategoryByName(farmSchema: string, name: string) {
  const { stockCategories } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(stockCategories).where(eq(stockCategories.name, name)).limit(1)
  return row ?? null
}

export async function findItemsByCategory(farmSchema: string, categoryId: string) {
  const { stockItems } = getFarmSchema(farmSchema)
  return db.select().from(stockItems).where(eq(stockItems.categoryId, categoryId))
}

export async function findActiveItemsByCategory(farmSchema: string, categoryId: string) {
  const { stockItems } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(stockItems)
    .where(and(eq(stockItems.categoryId, categoryId), eq(stockItems.isActive, true)))
}

export async function findItemById(farmSchema: string, id: string) {
  const { stockItems } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(stockItems).where(eq(stockItems.id, id)).limit(1)
  return row ?? null
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertCategory(farmSchema: string, data: any) {
  const { stockCategories } = getFarmSchema(farmSchema)
  const [row] = await db.insert(stockCategories).values(data).returning()
  return row!
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertStockItem(farmSchema: string, data: any) {
  const { stockItems } = getFarmSchema(farmSchema)
  const [row] = await db.insert(stockItems).values(data).returning()
  return row!
}

export async function updateStockItemActive(farmSchema: string, id: string, isActive: boolean): Promise<void> {
  const { stockItems } = getFarmSchema(farmSchema)
  await db.update(stockItems).set({ isActive }).where(eq(stockItems.id, id))
}
