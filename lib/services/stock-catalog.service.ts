import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  findActiveItemsByCategory,
  findItemsByCategory,
  findItemById,
  insertCategory,
  insertStockItem,
  updateStockItemActive,
  updateStockItemBundleMethod,
} from '@/lib/db/queries/stock-catalog.queries'
import type { StockCategory, StockItem } from '@/lib/db/schema'

type CreateCategoryInput = { name: string; unit: string }
type CreateStockItemInput = { categoryId: string; name: string }

export async function getCategories(farmSchema: string): Promise<StockCategory[]> {
  return findAllCategories(farmSchema)
}

export type CategoryWithItems = StockCategory & { items: StockItem[] }

export async function getCategoriesWithActiveItems(farmSchema: string): Promise<CategoryWithItems[]> {
  const cats = await findAllCategories(farmSchema)
  return Promise.all(
    cats.map(async (cat) => ({
      ...cat,
      items: await findActiveItemsByCategory(farmSchema, cat.id),
    }))
  )
}

export async function getCategoryWithItems(
  farmSchema: string,
  categoryId: string
): Promise<{ category: StockCategory; items: StockItem[] }> {
  const category = await findCategoryById(farmSchema, categoryId)
  if (!category) throw new Error('Kategori tidak ditemukan')
  const items = await findItemsByCategory(farmSchema, categoryId)
  return { category, items }
}

export async function getActiveItemsByCategory(farmSchema: string, categoryId: string): Promise<StockItem[]> {
  return findActiveItemsByCategory(farmSchema, categoryId)
}

export async function getActiveItemsByCategoryName(farmSchema: string, name: string): Promise<StockItem[]> {
  const category = await findCategoryByName(farmSchema, name)
  if (!category) return []
  return findActiveItemsByCategory(farmSchema, category.id)
}

export async function getActiveEggItems(farmSchema: string): Promise<StockItem[]> {
  return getActiveItemsByCategoryName(farmSchema, 'Telur')
}

export async function getActiveFeedItems(farmSchema: string): Promise<StockItem[]> {
  return getActiveItemsByCategoryName(farmSchema, 'Pakan')
}

export async function getActiveVaccineItems(farmSchema: string): Promise<StockItem[]> {
  return getActiveItemsByCategoryName(farmSchema, 'Vaksin')
}

export async function createCategory(farmSchema: string, input: CreateCategoryInput): Promise<StockCategory> {
  const existing = await findCategoryByName(farmSchema, input.name)
  if (existing) throw new Error('Nama kategori sudah digunakan')
  return insertCategory(farmSchema, { name: input.name, unit: input.unit, isSystem: false })
}

export async function createStockItem(farmSchema: string, input: CreateStockItemInput): Promise<StockItem> {
  const category = await findCategoryById(farmSchema, input.categoryId)
  if (!category) throw new Error('Kategori tidak ditemukan')
  return insertStockItem(farmSchema, { categoryId: input.categoryId, name: input.name, isActive: true })
}

export async function toggleStockItemActive(farmSchema: string, itemId: string): Promise<void> {
  const item = await findItemById(farmSchema, itemId)
  if (!item) throw new Error('Item stok tidak ditemukan')
  await updateStockItemActive(farmSchema, itemId, !item.isActive)
}

export async function toggleBundleMethod(farmSchema: string, itemId: string): Promise<void> {
  const item = await findItemById(farmSchema, itemId)
  if (!item) throw new Error('Item stok tidak ditemukan')
  await updateStockItemBundleMethod(farmSchema, itemId, !item.useBundleMethod)
}
