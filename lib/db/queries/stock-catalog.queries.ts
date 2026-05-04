import { db } from '@/lib/db'
import { stockCategories, stockItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import type { StockCategory, StockItem, NewStockCategory, NewStockItem } from '@/lib/db/schema'

export async function findAllCategories(): Promise<StockCategory[]> {
  return db.select().from(stockCategories)
}

export async function findCategoryById(id: string): Promise<StockCategory | null> {
  const [row] = await db.select().from(stockCategories).where(eq(stockCategories.id, id)).limit(1)
  return row ?? null
}

export async function findCategoryByName(name: string): Promise<StockCategory | null> {
  const [row] = await db.select().from(stockCategories).where(eq(stockCategories.name, name)).limit(1)
  return row ?? null
}

export async function findItemsByCategory(categoryId: string): Promise<StockItem[]> {
  return db.select().from(stockItems).where(eq(stockItems.categoryId, categoryId))
}

export async function findActiveItemsByCategory(categoryId: string): Promise<StockItem[]> {
  return db
    .select()
    .from(stockItems)
    .where(and(eq(stockItems.categoryId, categoryId), eq(stockItems.isActive, true)))
}

export async function findItemById(id: string): Promise<StockItem | null> {
  const [row] = await db.select().from(stockItems).where(eq(stockItems.id, id)).limit(1)
  return row ?? null
}

export async function insertCategory(data: NewStockCategory): Promise<StockCategory> {
  const [row] = await db.insert(stockCategories).values(data).returning()
  return row!
}

export async function insertStockItem(data: NewStockItem): Promise<StockItem> {
  const [row] = await db.insert(stockItems).values(data).returning()
  return row!
}

export async function updateStockItemActive(id: string, isActive: boolean): Promise<void> {
  await db.update(stockItems).set({ isActive }).where(eq(stockItems.id, id))
}
