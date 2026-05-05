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
} from '@/lib/db/queries/stock-catalog.queries'
import type { StockCategory, StockItem } from '@/lib/db/schema'

type CreateCategoryInput = { name: string; unit: string }
type CreateStockItemInput = { categoryId: string; name: string }

export async function getCategories(): Promise<StockCategory[]> {
  return findAllCategories()
}

export type CategoryWithItems = StockCategory & { items: StockItem[] }

export async function getCategoriesWithActiveItems(): Promise<CategoryWithItems[]> {
  const cats = await findAllCategories()
  return Promise.all(
    cats.map(async (cat) => ({
      ...cat,
      items: await findActiveItemsByCategory(cat.id),
    }))
  )
}

export async function getCategoryWithItems(
  categoryId: string
): Promise<{ category: StockCategory; items: StockItem[] }> {
  const category = await findCategoryById(categoryId)
  if (!category) throw new Error('Kategori tidak ditemukan')
  const items = await findItemsByCategory(categoryId)
  return { category, items }
}

export async function getActiveItemsByCategory(categoryId: string): Promise<StockItem[]> {
  return findActiveItemsByCategory(categoryId)
}

export async function getActiveItemsByCategoryName(name: string): Promise<StockItem[]> {
  const category = await findCategoryByName(name)
  if (!category) return []
  return findActiveItemsByCategory(category.id)
}

export async function getActiveEggItems(): Promise<StockItem[]> {
  return getActiveItemsByCategoryName('Telur')
}

export async function getActiveFeedItems(): Promise<StockItem[]> {
  return getActiveItemsByCategoryName('Pakan')
}

export async function getActiveVaccineItems(): Promise<StockItem[]> {
  return getActiveItemsByCategoryName('Vaksin')
}

export async function createCategory(input: CreateCategoryInput): Promise<StockCategory> {
  const existing = await findCategoryByName(input.name)
  if (existing) throw new Error('Nama kategori sudah digunakan')
  return insertCategory({ name: input.name, unit: input.unit, isSystem: false })
}

export async function createStockItem(input: CreateStockItemInput): Promise<StockItem> {
  const category = await findCategoryById(input.categoryId)
  if (!category) throw new Error('Kategori tidak ditemukan')
  return insertStockItem({ categoryId: input.categoryId, name: input.name, isActive: true })
}

export async function toggleStockItemActive(itemId: string): Promise<void> {
  const item = await findItemById(itemId)
  if (!item) throw new Error('Item stok tidak ditemukan')
  await updateStockItemActive(itemId, !item.isActive)
}
