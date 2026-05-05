import { db } from './index'
import { flockPhases, stockCategories, stockItems } from './schema'

const STOCK_CATEGORIES = [
  { name: 'Telur', unit: 'butir' },
  { name: 'Pakan', unit: 'kg' },
  { name: 'Vaksin', unit: 'dosis' },
  { name: 'Ayam Hidup', unit: 'ekor' },
  { name: 'Packaging', unit: 'pcs' },
] as const

const ITEMS_BY_CATEGORY: Record<string, string[]> = {
  Telur: ['Grade A', 'Grade B'],
  Pakan: ['Layer Starter', 'Layer Finisher'],
  Vaksin: ['Newcastle', 'Avian Influenza'],
  'Ayam Hidup': ['Produksi'],
  Packaging: ['Karton 30'],
}

async function seed() {
  await db.insert(flockPhases).values([
    { name: 'Starter', minWeeks: 0, maxWeeks: 6, sortOrder: 1 },
    { name: 'Grower', minWeeks: 7, maxWeeks: 18, sortOrder: 2 },
    { name: 'Layer', minWeeks: 19, maxWeeks: 72, sortOrder: 3 },
    { name: 'Late-layer', minWeeks: 73, maxWeeks: null, sortOrder: 4 },
  ]).onConflictDoNothing()

  await db
    .insert(stockCategories)
    .values(STOCK_CATEGORIES.map((c) => ({ ...c, isSystem: true })))
    .onConflictDoNothing()

  const cats = await db.select().from(stockCategories)
  for (const cat of cats) {
    const items = ITEMS_BY_CATEGORY[cat.name]
    if (!items) continue
    await db
      .insert(stockItems)
      .values(items.map((name) => ({ categoryId: cat.id, name })))
      .onConflictDoNothing()
  }

  console.log('Seed selesai')
  process.exit(0)
}

seed().catch(console.error)
