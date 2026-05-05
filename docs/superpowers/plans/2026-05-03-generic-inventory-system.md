# Generic Inventory System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded egg-grade inventory with a flexible catalog-based multi-category stock system, and overhaul daily production input to support dynamic SKUs for eggs, feed, and vaccines.

**Architecture:** Two new master tables (`stock_categories`, `stock_items`) replace the hardcoded `grade` enum. `inventory_movements` references `stockItemId` instead of `grade`. Daily records split into a header table + three sub-tables (`daily_egg_records`, `daily_feed_records`, `daily_vaccine_records`). Feed and vaccine usage during daily input auto-creates OUT movements, reducing stock in real time.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM, Supabase PostgreSQL, Vitest, Zod, Tailwind v4

---

## File Map

### New schema files
- `lib/db/schema/stock-categories.ts` — catalog of stock types
- `lib/db/schema/stock-items.ts` — SKUs per category
- `lib/db/schema/daily-egg-records.ts` — egg production per SKU per day
- `lib/db/schema/daily-feed-records.ts` — feed usage per item per day
- `lib/db/schema/daily-vaccine-records.ts` — vaccine usage per item per day

### Modified schema files
- `lib/db/schema/inventory-movements.ts` — drop `grade`, add `stockItemId` (NOT NULL FK), make `flockId` nullable
- `lib/db/schema/stock-adjustments.ts` — drop `grade`, add `stockItemId` (NOT NULL FK), make `flockId` nullable
- `lib/db/schema/regrade-requests.ts` — drop `gradeFrom`, `gradeTo`, `flockId`; add `fromItemId`, `toItemId`
- `lib/db/schema/daily-records.ts` — drop `eggsGradeA`, `eggsGradeB`, `feedKg`, `avgWeightKg`
- `lib/db/schema/index.ts` — export all new tables

### Deleted schema files
- `lib/db/schema/inventory-snapshots.ts`

### New query files
- `lib/db/queries/stock-catalog.queries.ts` — CRUD for categories + items

### Modified query files
- `lib/db/queries/inventory.queries.ts` — rewrite balance queries using `stockItemId`
- `lib/db/queries/daily-record.queries.ts` — add `insertDailyRecordWithSubTables`
- `lib/db/queries/dashboard.queries.ts` — update `getStockSummary` (no more grade columns)

### New service files
- `lib/services/stock-catalog.service.ts` — admin CRUD for catalog

### Modified service files
- `lib/services/stock.service.ts` — replace all `grade` refs with `stockItemId`
- `lib/services/daily-record.service.ts` — overhaul `createDailyRecord` + `updateDailyRecord`
- `lib/services/lock-period.service.ts` — update `DailyRecordPatch` type
- `lib/services/import.service.ts` — update opening stock import (stockItemId instead of grade)

### New action files
- `lib/actions/stock-catalog.actions.ts` — admin catalog mutations

### Modified action files
- `lib/actions/stock.actions.ts` — update types (grade → stockItemId)
- `lib/actions/daily-record.actions.ts` — update schema + input types

### New pages
- `app/(app)/stok/beli/page.tsx` — stock purchase form
- `app/(app)/admin/stok-katalog/page.tsx` — catalog management

### Modified pages
- `app/(app)/stok/page.tsx` — tab layout (Telur/Pakan/Vaksin/Packaging/Lain-lain)
- `app/(app)/stok/sesuaikan/page.tsx` — cascading category→item dropdowns
- `app/(app)/stok/regrade/page.tsx` — item dropdowns, no flock
- `app/(app)/stok/regrade/[id]/page.tsx` — show item names instead of grade labels
- `app/(app)/produksi/input/page.tsx` — pass catalog items to form
- `app/(app)/produksi/[id]/edit/page.tsx` + `edit-form.tsx` — update for new schema
- `app/(app)/admin/page.tsx` — add link to stok-katalog

### New/modified form components
- `components/forms/daily-input-form.tsx` — full rewrite: 4-tab layout
- `components/forms/stock-catalog-form.tsx` — new: add/edit category + item
- `components/forms/stock-purchase-form.tsx` — new: buy stock form

### Modified service tests
- `lib/services/stock.service.test.ts` — update mocks for new signatures
- `lib/services/daily-record.service.test.ts` — update for new sub-table flow

---

## Task 1: New Schema — stock_categories and stock_items

**Files:**
- Create: `lib/db/schema/stock-categories.ts`
- Create: `lib/db/schema/stock-items.ts`
- Modify: `lib/db/schema/index.ts`

- [ ] **Step 1: Write stock-categories schema**

```typescript
// lib/db/schema/stock-categories.ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const stockCategories = pgTable('stock_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  unit: text('unit').notNull(),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type StockCategory = typeof stockCategories.$inferSelect
export type NewStockCategory = typeof stockCategories.$inferInsert
```

- [ ] **Step 2: Write stock-items schema**

```typescript
// lib/db/schema/stock-items.ts
import { pgTable, uuid, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { stockCategories } from './stock-categories'

export const stockItems = pgTable('stock_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => stockCategories.id),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [unique().on(t.categoryId, t.name)])

export type StockItem = typeof stockItems.$inferSelect
export type NewStockItem = typeof stockItems.$inferInsert
```

- [ ] **Step 3: Export from schema/index.ts**

Add to `lib/db/schema/index.ts`:
```typescript
export * from './stock-categories'
export * from './stock-items'
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema/stock-categories.ts lib/db/schema/stock-items.ts lib/db/schema/index.ts
git commit -m "feat(schema): add stock_categories and stock_items tables"
```

---

## Task 2: New Schema — daily sub-tables

**Files:**
- Create: `lib/db/schema/daily-egg-records.ts`
- Create: `lib/db/schema/daily-feed-records.ts`
- Create: `lib/db/schema/daily-vaccine-records.ts`
- Modify: `lib/db/schema/index.ts`

- [ ] **Step 1: Write daily-egg-records schema**

```typescript
// lib/db/schema/daily-egg-records.ts
import { pgTable, uuid, integer, numeric, unique } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'

export const dailyEggRecords = pgTable('daily_egg_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  qtyButir: integer('qty_butir').notNull().default(0),
  qtyKg: numeric('qty_kg', { precision: 8, scale: 2 }).notNull().default('0'),
}, (t) => [unique().on(t.dailyRecordId, t.stockItemId)])

export type DailyEggRecord = typeof dailyEggRecords.$inferSelect
export type NewDailyEggRecord = typeof dailyEggRecords.$inferInsert
```

- [ ] **Step 2: Write daily-feed-records schema**

```typescript
// lib/db/schema/daily-feed-records.ts
import { pgTable, uuid, numeric, unique } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'

export const dailyFeedRecords = pgTable('daily_feed_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  qtyUsed: numeric('qty_used', { precision: 8, scale: 2 }).notNull(),
}, (t) => [unique().on(t.dailyRecordId, t.stockItemId)])

export type DailyFeedRecord = typeof dailyFeedRecords.$inferSelect
export type NewDailyFeedRecord = typeof dailyFeedRecords.$inferInsert
```

- [ ] **Step 3: Write daily-vaccine-records schema**

```typescript
// lib/db/schema/daily-vaccine-records.ts
import { pgTable, uuid, numeric, unique } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'

export const dailyVaccineRecords = pgTable('daily_vaccine_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  qtyUsed: numeric('qty_used', { precision: 8, scale: 2 }).notNull(),
}, (t) => [unique().on(t.dailyRecordId, t.stockItemId)])

export type DailyVaccineRecord = typeof dailyVaccineRecords.$inferSelect
export type NewDailyVaccineRecord = typeof dailyVaccineRecords.$inferInsert
```

- [ ] **Step 4: Export from schema/index.ts**

Add to `lib/db/schema/index.ts`:
```typescript
export * from './daily-egg-records'
export * from './daily-feed-records'
export * from './daily-vaccine-records'
```

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema/daily-egg-records.ts lib/db/schema/daily-feed-records.ts lib/db/schema/daily-vaccine-records.ts lib/db/schema/index.ts
git commit -m "feat(schema): add daily_egg_records, daily_feed_records, daily_vaccine_records"
```

---

## Task 3: Modify existing schemas

**Files:**
- Modify: `lib/db/schema/inventory-movements.ts`
- Modify: `lib/db/schema/stock-adjustments.ts`
- Modify: `lib/db/schema/regrade-requests.ts`
- Modify: `lib/db/schema/daily-records.ts`
- Delete: `lib/db/schema/inventory-snapshots.ts`

- [ ] **Step 1: Update inventory-movements.ts**

Replace the file content with:
```typescript
import { pgTable, uuid, integer, date, timestamp, text, pgEnum, boolean } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { flocks } from './flocks'
import { users } from './users'

export const movementTypeEnum = pgEnum('movement_type', ['in', 'out'])
export const movementSourceEnum = pgEnum('movement_source', [
  'production', 'sale', 'adjustment', 'regrade', 'import', 'purchase',
])
export const movementSourceTypeEnum = pgEnum('movement_source_type', [
  'daily_egg_records', 'daily_feed_records', 'daily_vaccine_records',
  'sales_order_items', 'stock_adjustments', 'regrade_requests',
  'sales_returns', 'import',
])

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  flockId: uuid('flock_id').references(() => flocks.id),
  movementType: movementTypeEnum('movement_type').notNull(),
  source: movementSourceEnum('source').notNull(),
  sourceType: movementSourceTypeEnum('source_type').notNull(),
  sourceId: uuid('source_id'),
  quantity: integer('quantity').notNull(),
  movementDate: date('movement_date').notNull(),
  note: text('note'),
  isImported: boolean('is_imported').notNull().default(false),
  importedBy: uuid('imported_by').references(() => users.id),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert
```

- [ ] **Step 2: Update stock-adjustments.ts**

Replace file content:
```typescript
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { flocks } from './flocks'
import { users } from './users'

export const stockAdjustments = pgTable('stock_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  flockId: uuid('flock_id').references(() => flocks.id),
  quantity: integer('quantity').notNull(), // signed: positive = add, negative = remove
  reason: text('reason').notNull(),
  notes: text('notes'),
  adjustmentDate: date('adjustment_date').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type StockAdjustment = typeof stockAdjustments.$inferSelect
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert
```

- [ ] **Step 3: Update regrade-requests.ts**

Replace file content:
```typescript
import { pgTable, uuid, integer, date, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { users } from './users'

export const regradeStatusEnum = pgEnum('regrade_status', ['PENDING', 'APPROVED', 'REJECTED'])

export const regradeRequests = pgTable('regrade_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromItemId: uuid('from_item_id').notNull().references(() => stockItems.id),
  toItemId: uuid('to_item_id').notNull().references(() => stockItems.id),
  quantity: integer('quantity').notNull(), // always positive
  requestDate: date('request_date').notNull(),
  status: regradeStatusEnum('status').notNull().default('PENDING'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type RegradeRequest = typeof regradeRequests.$inferSelect
export type NewRegradeRequest = typeof regradeRequests.$inferInsert
```

- [ ] **Step 4: Update daily-records.ts** — drop egg/feed/weight columns

Read the current file first, then remove `eggsGradeA`, `eggsGradeB`, `feedKg`, `avgWeightKg` columns. Keep: `id`, `flockId`, `recordDate`, `deaths`, `culled`, `eggsCracked`, `eggsAbnormal`, `isLateInput`, `notes`, `createdBy`, `createdAt`, `isImported`, `importedBy`.

The updated file should look like:
```typescript
import { pgTable, uuid, integer, date, timestamp, boolean, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const dailyRecords = pgTable('daily_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  recordDate: date('record_date').notNull(),
  deaths: integer('deaths').notNull().default(0),
  culled: integer('culled').notNull().default(0),
  eggsCracked: integer('eggs_cracked').notNull().default(0),
  eggsAbnormal: integer('eggs_abnormal').notNull().default(0),
  isLateInput: boolean('is_late_input').notNull().default(false),
  notes: text('notes'),
  isImported: boolean('is_imported').notNull().default(false),
  importedBy: uuid('imported_by').references(() => users.id),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [uniqueIndex('daily_records_flock_date_idx').on(t.flockId, t.recordDate)])

export type DailyRecord = typeof dailyRecords.$inferSelect
export type NewDailyRecord = typeof dailyRecords.$inferInsert
```

Note: add `text` to imports since we added `notes`.

- [ ] **Step 5: Delete inventory-snapshots.ts and remove from index**

```bash
rm lib/db/schema/inventory-snapshots.ts
```

Remove its export from `lib/db/schema/index.ts`.

- [ ] **Step 6: Commit**

```bash
git add lib/db/schema/inventory-movements.ts lib/db/schema/stock-adjustments.ts lib/db/schema/regrade-requests.ts lib/db/schema/daily-records.ts lib/db/schema/index.ts
git rm lib/db/schema/inventory-snapshots.ts
git commit -m "feat(schema): replace grade enum with stockItemId, overhaul daily_records schema"
```

---

## Task 4: Generate and apply database migration

**Files:**
- Create: `lib/db/migrations/<timestamp>_generic_inventory.sql` (auto-generated)

- [ ] **Step 1: Generate migration**

```bash
npm run db:generate
```

Expected: new SQL file in `lib/db/migrations/`. Inspect it — confirm it includes:
- `CREATE TABLE stock_categories`
- `CREATE TABLE stock_items`
- `CREATE TABLE daily_egg_records`
- `CREATE TABLE daily_feed_records`
- `CREATE TABLE daily_vaccine_records`
- `ALTER TABLE inventory_movements` (drop grade, add stock_item_id)
- `ALTER TABLE stock_adjustments` (drop grade, add stock_item_id)
- `ALTER TABLE regrade_requests` (drop gradeFrom/gradeTo/flockId, add fromItemId/toItemId)
- `ALTER TABLE daily_records` (drop eggsGradeA, eggsGradeB, feedKg, avgWeightKg)
- `DROP TABLE inventory_snapshots`

**WARNING:** Review the SQL before applying. Confirm no unintended `DROP TABLE` or `DROP COLUMN` on tables you want to keep.

- [ ] **Step 2: Truncate existing inventory data before migration**

Since data is dummy, run this in Supabase SQL Editor or via `psql` before applying migration:
```sql
TRUNCATE inventory_movements, inventory_snapshots, stock_adjustments, regrade_requests CASCADE;
TRUNCATE daily_records CASCADE;
```

- [ ] **Step 3: Apply migration**

```bash
npm run db:migrate
```

Expected: migration applies without errors.

- [ ] **Step 4: Verify in Drizzle Studio**

```bash
npm run db:studio
```

Open browser, confirm all 5 new tables exist and old `grade` columns are gone from `inventory_movements`, `stock_adjustments`, `regrade_requests`.

- [ ] **Step 5: Commit migration file**

```bash
git add lib/db/migrations/
git commit -m "feat(migration): generic inventory system schema migration"
```

---

## Task 5: Seed stock_categories and stock_items

**Files:**
- Modify: `lib/db/seed.ts`

- [ ] **Step 1: Update seed.ts to seed catalog data**

```typescript
// lib/db/seed.ts
import { db } from './index'
import { flockPhases, stockCategories, stockItems } from './schema'

async function seed() {
  console.log('Seeding flock phases...')
  // existing flock phase seed — keep as-is

  console.log('Seeding stock catalog...')

  const [telur] = await db.insert(stockCategories).values({
    name: 'Telur', unit: 'butir', isSystem: true,
  }).onConflictDoNothing().returning()

  const [pakan] = await db.insert(stockCategories).values({
    name: 'Pakan', unit: 'kg', isSystem: true,
  }).onConflictDoNothing().returning()

  const [vaksin] = await db.insert(stockCategories).values({
    name: 'Vaksin', unit: 'dosis', isSystem: true,
  }).onConflictDoNothing().returning()

  const [ayam] = await db.insert(stockCategories).values({
    name: 'Ayam Hidup', unit: 'ekor', isSystem: true,
  }).onConflictDoNothing().returning()

  const [packaging] = await db.insert(stockCategories).values({
    name: 'Packaging', unit: 'pcs', isSystem: true,
  }).onConflictDoNothing().returning()

  if (telur) {
    await db.insert(stockItems).values([
      { categoryId: telur.id, name: 'Grade A' },
      { categoryId: telur.id, name: 'Grade B' },
    ]).onConflictDoNothing()
  }

  if (pakan) {
    await db.insert(stockItems).values([
      { categoryId: pakan.id, name: 'Layer Starter' },
      { categoryId: pakan.id, name: 'Layer Finisher' },
    ]).onConflictDoNothing()
  }

  if (vaksin) {
    await db.insert(stockItems).values([
      { categoryId: vaksin.id, name: 'Newcastle' },
      { categoryId: vaksin.id, name: 'Avian Influenza' },
    ]).onConflictDoNothing()
  }

  if (ayam) {
    await db.insert(stockItems).values([
      { categoryId: ayam.id, name: 'Produksi' },
    ]).onConflictDoNothing()
  }

  if (packaging) {
    await db.insert(stockItems).values([
      { categoryId: packaging.id, name: 'Karton 30' },
    ]).onConflictDoNothing()
  }

  console.log('Seed complete.')
}

seed().catch(console.error)
```

- [ ] **Step 2: Run seed**

```bash
npm run db:seed
```

Expected: no errors. Verify in Drizzle Studio that 5 categories and 8 items exist.

- [ ] **Step 3: Commit**

```bash
git add lib/db/seed.ts
git commit -m "feat(seed): seed stock_categories and stock_items catalog"
```

---

## Task 6: stock-catalog queries and service

**Files:**
- Create: `lib/db/queries/stock-catalog.queries.ts`
- Create: `lib/services/stock-catalog.service.ts`

- [ ] **Step 1: Write stock-catalog.queries.ts**

```typescript
// lib/db/queries/stock-catalog.queries.ts
import { db } from '@/lib/db'
import { stockCategories, stockItems } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { StockCategory, NewStockCategory, StockItem, NewStockItem } from '@/lib/db/schema'

export async function findAllCategories(): Promise<StockCategory[]> {
  return db.select().from(stockCategories).orderBy(asc(stockCategories.name))
}

export async function findCategoryById(id: string): Promise<StockCategory | null> {
  const rows = await db.select().from(stockCategories).where(eq(stockCategories.id, id))
  return rows[0] ?? null
}

export async function findCategoryByName(name: string): Promise<StockCategory | null> {
  const rows = await db.select().from(stockCategories).where(eq(stockCategories.name, name))
  return rows[0] ?? null
}

export async function insertCategory(data: NewStockCategory): Promise<StockCategory> {
  const rows = await db.insert(stockCategories).values(data).returning()
  return rows[0]!
}

export async function findItemsByCategoryId(categoryId: string): Promise<StockItem[]> {
  return db.select().from(stockItems)
    .where(eq(stockItems.categoryId, categoryId))
    .orderBy(asc(stockItems.name))
}

export async function findActiveItemsByCategoryId(categoryId: string): Promise<StockItem[]> {
  return db.select().from(stockItems)
    .where(eq(stockItems.categoryId, categoryId) && eq(stockItems.isActive, true) as any)
    .orderBy(asc(stockItems.name))
}

export async function findItemById(id: string): Promise<StockItem | null> {
  const rows = await db.select().from(stockItems).where(eq(stockItems.id, id))
  return rows[0] ?? null
}

export async function insertStockItem(data: NewStockItem): Promise<StockItem> {
  const rows = await db.insert(stockItems).values(data).returning()
  return rows[0]!
}

export async function updateStockItemActive(id: string, isActive: boolean): Promise<void> {
  await db.update(stockItems).set({ isActive }).where(eq(stockItems.id, id))
}
```

Note: the `&&` in `findActiveItemsByCategoryId` needs to use Drizzle's `and()`. Fix:
```typescript
import { eq, asc, and } from 'drizzle-orm'
// ...
.where(and(eq(stockItems.categoryId, categoryId), eq(stockItems.isActive, true)))
```

- [ ] **Step 2: Write stock-catalog.service.ts**

```typescript
// lib/services/stock-catalog.service.ts
import {
  findAllCategories,
  findCategoryById,
  findCategoryByName,
  insertCategory,
  findItemsByCategoryId,
  findActiveItemsByCategoryId,
  findItemById,
  insertStockItem,
  updateStockItemActive,
} from '@/lib/db/queries/stock-catalog.queries'
import type { StockCategory, StockItem } from '@/lib/db/schema'

export async function getCategories(): Promise<StockCategory[]> {
  return findAllCategories()
}

export async function getCategoryWithItems(categoryId: string) {
  const [category, items] = await Promise.all([
    findCategoryById(categoryId),
    findItemsByCategoryId(categoryId),
  ])
  if (!category) throw new Error('Kategori tidak ditemukan')
  return { category, items }
}

export async function getActiveItemsByCategory(categoryId: string): Promise<StockItem[]> {
  return findActiveItemsByCategoryId(categoryId)
}

export async function getActiveEggItems(): Promise<StockItem[]> {
  const cat = await findCategoryByName('Telur')
  if (!cat) return []
  return findActiveItemsByCategoryId(cat.id)
}

export async function getActiveFeedItems(): Promise<StockItem[]> {
  const cat = await findCategoryByName('Pakan')
  if (!cat) return []
  return findActiveItemsByCategoryId(cat.id)
}

export async function getActiveVaccineItems(): Promise<StockItem[]> {
  const cat = await findCategoryByName('Vaksin')
  if (!cat) return []
  return findActiveItemsByCategoryId(cat.id)
}

type CreateCategoryInput = { name: string; unit: string }

export async function createCategory(input: CreateCategoryInput): Promise<StockCategory> {
  const existing = await findCategoryByName(input.name)
  if (existing) throw new Error(`Kategori "${input.name}" sudah ada`)
  return insertCategory({ name: input.name, unit: input.unit, isSystem: false })
}

type CreateStockItemInput = { categoryId: string; name: string }

export async function createStockItem(input: CreateStockItemInput): Promise<StockItem> {
  const category = await findCategoryById(input.categoryId)
  if (!category) throw new Error('Kategori tidak ditemukan')
  return insertStockItem({ categoryId: input.categoryId, name: input.name })
}

export async function toggleStockItemActive(itemId: string): Promise<void> {
  const item = await findItemById(itemId)
  if (!item) throw new Error('Item tidak ditemukan')
  await updateStockItemActive(itemId, !item.isActive)
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries/stock-catalog.queries.ts lib/services/stock-catalog.service.ts
git commit -m "feat(catalog): add stock-catalog queries and service"
```

---

## Task 7: Rewrite inventory queries

**Files:**
- Modify: `lib/db/queries/inventory.queries.ts`

- [ ] **Step 1: Rewrite inventory.queries.ts**

```typescript
// lib/db/queries/inventory.queries.ts
import { db, DrizzleTx } from '@/lib/db'
import { inventoryMovements, stockAdjustments, regradeRequests, stockItems, stockCategories } from '@/lib/db/schema'
import { eq, and, sql, sum, desc } from 'drizzle-orm'
import type {
  NewInventoryMovement,
  StockAdjustment, NewStockAdjustment,
  RegradeRequest, NewRegradeRequest,
} from '@/lib/db/schema'

export async function getStockBalance(stockItemId: string): Promise<number> {
  const rows = await db
    .select({
      balance: sql<number>`SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END)`,
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.stockItemId, stockItemId))
  return Number(rows[0]?.balance ?? 0)
}

export type StockBalanceRow = {
  stockItemId: string
  itemName: string
  categoryId: string
  categoryName: string
  unit: string
  balance: number
}

export async function getAllStockBalances(): Promise<StockBalanceRow[]> {
  const rows = await db
    .select({
      stockItemId: inventoryMovements.stockItemId,
      itemName: stockItems.name,
      categoryId: stockItems.categoryId,
      categoryName: stockCategories.name,
      unit: stockCategories.unit,
      balance: sql<number>`SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END)`,
    })
    .from(inventoryMovements)
    .innerJoin(stockItems, eq(inventoryMovements.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .groupBy(inventoryMovements.stockItemId, stockItems.name, stockItems.categoryId, stockCategories.name, stockCategories.unit)
  return rows.map(r => ({ ...r, balance: Number(r.balance) }))
}

export async function insertMovement(data: NewInventoryMovement, tx?: DrizzleTx): Promise<void> {
  const client = tx ?? db
  await client.insert(inventoryMovements).values(data)
}

export async function insertStockAdjustmentWithMovement(
  adjustment: NewStockAdjustment,
  movement: NewInventoryMovement
): Promise<StockAdjustment> {
  return db.transaction(async (tx) => {
    const [adj] = await tx.insert(stockAdjustments).values(adjustment).returning()
    await tx.insert(inventoryMovements).values({ ...movement, sourceId: adj!.id })
    return adj!
  })
}

export async function findPendingRegradeRequests(): Promise<RegradeRequest[]> {
  return db.select().from(regradeRequests)
    .where(eq(regradeRequests.status, 'PENDING'))
    .orderBy(desc(regradeRequests.createdAt))
}

export async function findRegradeRequestById(id: string): Promise<RegradeRequest | null> {
  const rows = await db.select().from(regradeRequests).where(eq(regradeRequests.id, id))
  return rows[0] ?? null
}

export async function insertRegradeRequest(data: NewRegradeRequest): Promise<RegradeRequest> {
  const rows = await db.insert(regradeRequests).values(data).returning()
  return rows[0]!
}

export async function updateRegradeRequestStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string
): Promise<void> {
  await db.update(regradeRequests)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(regradeRequests.id, id))
}

export async function approveRegradeRequestTx(requestId: string, reviewedBy: string): Promise<void> {
  return db.transaction(async (tx) => {
    const [req] = await tx.select().from(regradeRequests).where(eq(regradeRequests.id, requestId))
    if (!req) throw new Error('Regrade request tidak ditemukan')
    if (req.status !== 'PENDING') throw new Error('Request sudah diproses')

    await tx.insert(inventoryMovements).values([
      {
        stockItemId: req.fromItemId,
        flockId: null,
        movementType: 'out',
        source: 'regrade',
        sourceType: 'regrade_requests',
        sourceId: req.id,
        quantity: req.quantity,
        movementDate: req.requestDate,
        createdBy: reviewedBy,
      },
      {
        stockItemId: req.toItemId,
        flockId: null,
        movementType: 'in',
        source: 'regrade',
        sourceType: 'regrade_requests',
        sourceId: req.id,
        quantity: req.quantity,
        movementDate: req.requestDate,
        createdBy: reviewedBy,
      },
    ])

    await tx.update(regradeRequests)
      .set({ status: 'APPROVED', reviewedBy, reviewedAt: new Date() })
      .where(eq(regradeRequests.id, requestId))
  })
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any type errors (likely around `DrizzleTx` imports or null coalescing).

- [ ] **Step 3: Commit**

```bash
git add lib/db/queries/inventory.queries.ts
git commit -m "feat(queries): rewrite inventory queries for generic stock model"
```

---

## Task 8: Refactor stock.service.ts

**Files:**
- Modify: `lib/services/stock.service.ts`
- Modify: `lib/services/stock.service.test.ts`

- [ ] **Step 1: Write failing tests for new signatures**

```typescript
// lib/services/stock.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/services/lock-period.service', () => ({
  assertCanEdit: vi.fn(),
}))

vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalance: vi.fn(),
  insertStockAdjustmentWithMovement: vi.fn(),
  findPendingRegradeRequests: vi.fn(),
  findRegradeRequestById: vi.fn(),
  insertRegradeRequest: vi.fn(),
  updateRegradeRequestStatus: vi.fn(),
  approveRegradeRequestTx: vi.fn(),
  insertMovement: vi.fn(),
}))

import * as q from '@/lib/db/queries/inventory.queries'
import {
  validateStockNotBelowZero,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
  createStockPurchase,
} from './stock.service'

beforeEach(() => vi.clearAllMocks())

describe('validateStockNotBelowZero', () => {
  it('does not throw when result is positive', () => {
    expect(() => validateStockNotBelowZero(100, -30)).not.toThrow()
  })
  it('throws when result would go negative', () => {
    expect(() => validateStockNotBelowZero(10, -20)).toThrow('Stok tidak mencukupi')
  })
})

describe('createStockAdjustment', () => {
  it('calls insertStockAdjustmentWithMovement with stockItemId', async () => {
    vi.mocked(q.getStockBalance).mockResolvedValue(100)
    vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any)
    await createStockAdjustment(
      { stockItemId: 'item-1', adjustmentDate: new Date('2026-01-01'), quantity: 10, reason: 'test' },
      'user-1', 'admin'
    )
    expect(q.insertStockAdjustmentWithMovement).toHaveBeenCalledOnce()
    const [adj] = vi.mocked(q.insertStockAdjustmentWithMovement).mock.calls[0]!
    expect(adj.stockItemId).toBe('item-1')
  })
})

describe('submitRegradeRequest', () => {
  it('creates request with fromItemId and toItemId', async () => {
    vi.mocked(q.getStockBalance).mockResolvedValue(500)
    vi.mocked(q.insertRegradeRequest).mockResolvedValue({ id: 'rr-1' } as any)
    await submitRegradeRequest(
      { fromItemId: 'item-a', toItemId: 'item-b', quantity: 100, requestDate: new Date() },
      'user-1'
    )
    expect(q.insertRegradeRequest).toHaveBeenCalledOnce()
    const [req] = vi.mocked(q.insertRegradeRequest).mock.calls[0]!
    expect(req.fromItemId).toBe('item-a')
  })
})

describe('createStockPurchase', () => {
  it('inserts an IN movement with source purchase', async () => {
    vi.mocked(q.insertMovement).mockResolvedValue(undefined)
    await createStockPurchase(
      { stockItemId: 'item-1', quantity: 50, purchaseDate: new Date('2026-01-01') },
      'user-1'
    )
    expect(q.insertMovement).toHaveBeenCalledOnce()
    const [movement] = vi.mocked(q.insertMovement).mock.calls[0]!
    expect(movement.movementType).toBe('in')
    expect(movement.source).toBe('purchase')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run lib/services/stock.service.test.ts
```

Expected: FAIL — functions not yet updated.

- [ ] **Step 3: Rewrite stock.service.ts**

```typescript
// lib/services/stock.service.ts
import {
  getStockBalance as _getStockBalance,
  insertStockAdjustmentWithMovement,
  findPendingRegradeRequests,
  findRegradeRequestById,
  insertRegradeRequest,
  updateRegradeRequestStatus,
  approveRegradeRequestTx,
  insertMovement,
} from '@/lib/db/queries/inventory.queries'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { StockAdjustment, RegradeRequest } from '@/lib/db/schema'

type Role = 'operator' | 'supervisor' | 'admin'

export async function getStockBalance(stockItemId: string): Promise<number> {
  return _getStockBalance(stockItemId)
}

export function validateStockNotBelowZero(currentBalance: number, quantity: number): void {
  if (currentBalance + quantity < 0) {
    throw new Error('Stok tidak mencukupi')
  }
}

type AdjustmentInput = {
  stockItemId: string
  adjustmentDate: Date
  quantity: number // signed
  reason: string
  notes?: string
}

export async function createStockAdjustment(
  input: AdjustmentInput,
  userId: string,
  role: Role = 'admin',
  now: Date = new Date()
): Promise<StockAdjustment> {
  assertCanEdit(input.adjustmentDate, role, now)
  if (input.quantity < 0) {
    const balance = await _getStockBalance(input.stockItemId)
    validateStockNotBelowZero(balance, input.quantity)
  }
  const movementType = input.quantity >= 0 ? 'in' : 'out'
  return insertStockAdjustmentWithMovement(
    {
      stockItemId: input.stockItemId,
      flockId: null,
      quantity: input.quantity,
      reason: input.reason,
      notes: input.notes,
      adjustmentDate: input.adjustmentDate.toISOString().split('T')[0]!,
      createdBy: userId,
    },
    {
      stockItemId: input.stockItemId,
      flockId: null,
      movementType,
      source: 'adjustment',
      sourceType: 'stock_adjustments',
      sourceId: null,
      quantity: Math.abs(input.quantity),
      movementDate: input.adjustmentDate.toISOString().split('T')[0]!,
      createdBy: userId,
    }
  )
}

type RegradeInput = {
  fromItemId: string
  toItemId: string
  quantity: number
  requestDate: Date
  notes?: string
}

export async function submitRegradeRequest(
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest> {
  const balance = await _getStockBalance(input.fromItemId)
  validateStockNotBelowZero(balance, -input.quantity)
  return insertRegradeRequest({
    fromItemId: input.fromItemId,
    toItemId: input.toItemId,
    quantity: input.quantity,
    requestDate: input.requestDate.toISOString().split('T')[0]!,
    notes: input.notes,
    status: 'PENDING',
    createdBy: userId,
  })
}

export async function approveRegradeRequest(requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(requestId)
  if (!req) throw new Error('Regrade request tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Request sudah diproses')
  await approveRegradeRequestTx(requestId, adminId)
}

export async function rejectRegradeRequest(requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(requestId)
  if (!req) throw new Error('Regrade request tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Request sudah diproses')
  await updateRegradeRequestStatus(requestId, 'REJECTED', adminId)
}

export async function getPendingRegradeRequests(): Promise<RegradeRequest[]> {
  return findPendingRegradeRequests()
}

type StockPurchaseInput = {
  stockItemId: string
  quantity: number
  purchaseDate: Date
  notes?: string
}

export async function createStockPurchase(
  input: StockPurchaseInput,
  userId: string
): Promise<void> {
  await insertMovement({
    stockItemId: input.stockItemId,
    flockId: null,
    movementType: 'in',
    source: 'purchase',
    sourceType: 'import', // using import as closest existing sourceType; revisit if needed
    sourceId: null,
    quantity: input.quantity,
    movementDate: input.purchaseDate.toISOString().split('T')[0]!,
    note: input.notes,
    createdBy: userId,
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run lib/services/stock.service.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/stock.service.ts lib/services/stock.service.test.ts
git commit -m "feat(service): refactor stock.service to use stockItemId"
```

---

## Task 9: Overhaul daily-record queries and service

**Files:**
- Modify: `lib/db/queries/daily-record.queries.ts`
- Modify: `lib/services/daily-record.service.ts`
- Modify: `lib/services/daily-record.service.test.ts`

- [ ] **Step 1: Add insertDailyRecordWithSubTables to daily-record.queries.ts**

Read the existing `lib/db/queries/daily-record.queries.ts` first, then add this function (keep all existing functions):

```typescript
// Add these imports at top:
import { dailyEggRecords, dailyFeedRecords, dailyVaccineRecords, inventoryMovements } from '@/lib/db/schema'
import type { NewDailyEggRecord, NewDailyFeedRecord, NewDailyVaccineRecord, NewInventoryMovement } from '@/lib/db/schema'

export type DailySubTableInput = {
  record: NewDailyRecord
  eggEntries: Omit<NewDailyEggRecord, 'dailyRecordId'>[]
  feedEntries: Omit<NewDailyFeedRecord, 'dailyRecordId'>[]
  vaccineEntries: Omit<NewDailyVaccineRecord, 'dailyRecordId'>[]
  eggMovements: Omit<NewInventoryMovement, 'sourceId'>[]
  feedMovements: Omit<NewInventoryMovement, 'sourceId'>[]
  vaccineMovements: Omit<NewInventoryMovement, 'sourceId'>[]
}

export async function insertDailyRecordWithSubTables(input: DailySubTableInput): Promise<DailyRecord> {
  return db.transaction(async (tx) => {
    // Delete existing sub-records for this flock+date if re-submitting
    const existing = await tx.select({ id: dailyRecords.id })
      .from(dailyRecords)
      .where(and(eq(dailyRecords.flockId, input.record.flockId!), eq(dailyRecords.recordDate, input.record.recordDate)))
    
    if (existing[0]) {
      await tx.delete(dailyEggRecords).where(eq(dailyEggRecords.dailyRecordId, existing[0].id))
      await tx.delete(dailyFeedRecords).where(eq(dailyFeedRecords.dailyRecordId, existing[0].id))
      await tx.delete(dailyVaccineRecords).where(eq(dailyVaccineRecords.dailyRecordId, existing[0].id))
      // Delete old production movements for this record
      await tx.delete(inventoryMovements)
        .where(and(
          eq(inventoryMovements.sourceType, 'daily_egg_records'),
          // Note: we clean up by sourceId which we set to dailyRecord.id
        ))
    }

    const [dailyRecord] = await tx.insert(dailyRecords).values(input.record)
      .onConflictDoUpdate({
        target: [dailyRecords.flockId, dailyRecords.recordDate],
        set: { deaths: input.record.deaths, culled: input.record.culled, notes: input.record.notes, eggsCracked: input.record.eggsCracked, eggsAbnormal: input.record.eggsAbnormal },
      })
      .returning()

    const recordId = dailyRecord!.id

    if (input.eggEntries.length > 0) {
      await tx.insert(dailyEggRecords).values(input.eggEntries.map(e => ({ ...e, dailyRecordId: recordId })))
    }
    if (input.feedEntries.length > 0) {
      await tx.insert(dailyFeedRecords).values(input.feedEntries.map(e => ({ ...e, dailyRecordId: recordId })))
    }
    if (input.vaccineEntries.length > 0) {
      await tx.insert(dailyVaccineRecords).values(input.vaccineEntries.map(e => ({ ...e, dailyRecordId: recordId })))
    }

    const allMovements = [
      ...input.eggMovements.map(m => ({ ...m, sourceId: recordId })),
      ...input.feedMovements.map(m => ({ ...m, sourceId: recordId })),
      ...input.vaccineMovements.map(m => ({ ...m, sourceId: recordId })),
    ]
    if (allMovements.length > 0) {
      await tx.insert(inventoryMovements).values(allMovements)
    }

    return dailyRecord!
  })
}
```

- [ ] **Step 2: Update daily-record.service.ts — CreateDailyRecordInput type**

Update the `CreateDailyRecordInput` type and `createDailyRecord` function:

```typescript
// New input types
type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
type FeedEntry = { stockItemId: string; qtyUsed: number }
type VaccineEntry = { stockItemId: string; qtyUsed: number }

type CreateDailyRecordInput = {
  flockId: string
  recordDate: Date
  deaths: number
  culled: number
  eggsCracked: number
  eggsAbnormal: number
  eggs: EggEntry[]
  feed: FeedEntry[]
  vaccines: VaccineEntry[]
  notes?: string
}
```

Update `createDailyRecord` to use `insertDailyRecordWithSubTables`:

```typescript
export async function createDailyRecord(
  input: CreateDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
  validateBackdate(input.recordDate, now, role)
  assertCanEdit(input.recordDate, role, now)

  const flock = await findFlockById(input.flockId)
  if (!flock) throw new Error('Flock tidak ditemukan')

  const isLateInput = computeIsLateInput(input.recordDate, now)
  const dateStr = input.recordDate.toISOString().split('T')[0]!

  const eggMovements = input.eggs
    .filter(e => e.qtyButir > 0)
    .map(e => ({
      stockItemId: e.stockItemId,
      flockId: input.flockId,
      movementType: 'in' as const,
      source: 'production' as const,
      sourceType: 'daily_egg_records' as const,
      quantity: e.qtyButir,
      movementDate: dateStr,
      createdBy: userId,
    }))

  const feedMovements = input.feed
    .filter(f => Number(f.qtyUsed) > 0)
    .map(f => ({
      stockItemId: f.stockItemId,
      flockId: input.flockId,
      movementType: 'out' as const,
      source: 'production' as const,
      sourceType: 'daily_feed_records' as const,
      quantity: Math.round(Number(f.qtyUsed) * 100), // store as integer (grams)
      movementDate: dateStr,
      createdBy: userId,
    }))

  const vaccineMovements = input.vaccines
    .filter(v => Number(v.qtyUsed) > 0)
    .map(v => ({
      stockItemId: v.stockItemId,
      flockId: input.flockId,
      movementType: 'out' as const,
      source: 'production' as const,
      sourceType: 'daily_vaccine_records' as const,
      quantity: Math.round(Number(v.qtyUsed) * 100),
      movementDate: dateStr,
      createdBy: userId,
    }))

  return insertDailyRecordWithSubTables({
    record: {
      flockId: input.flockId,
      recordDate: dateStr,
      deaths: input.deaths,
      culled: input.culled,
      eggsCracked: input.eggsCracked,
      eggsAbnormal: input.eggsAbnormal,
      isLateInput,
      notes: input.notes,
      createdBy: userId,
    },
    eggEntries: input.eggs.map(e => ({
      stockItemId: e.stockItemId,
      qtyButir: e.qtyButir,
      qtyKg: String(e.qtyKg),
    })),
    feedEntries: input.feed.map(f => ({
      stockItemId: f.stockItemId,
      qtyUsed: String(f.qtyUsed),
    })),
    vaccineEntries: input.vaccines.map(v => ({
      stockItemId: v.stockItemId,
      qtyUsed: String(v.qtyUsed),
    })),
    eggMovements,
    feedMovements,
    vaccineMovements,
  })
}
```

**Important note on feed/vaccine quantities:** `inventory_movements.quantity` is `integer`. Feed is in kg (decimal), vaccines in doses (can be decimal). Two options: (a) store as integer grams/centidoses (multiply × 100 then round), or (b) change `quantity` to `numeric`. Recommend option (b) — change `inventory_movements.quantity` to `numeric(10,2)` to avoid precision loss. Update the schema and re-generate migration if needed.

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix type errors. Common ones: `insertDailyRecordWithSubTables` import, `text` not imported in daily-records schema.

- [ ] **Step 4: Update daily-record.service.test.ts**

Update the mocks and test cases to use new `CreateDailyRecordInput` shape (eggs/feed/vaccines arrays instead of eggsGradeA/eggsGradeB/feedKg):

```typescript
vi.mock('@/lib/db/queries/daily-record.queries', () => ({
  findDailyRecord: vi.fn(),
  insertDailyRecordWithSubTables: vi.fn(),
  getTotalDepletionByFlock: vi.fn(),
  getCumulativeDepletionByFlockUpTo: vi.fn(),
  getProductionReport: vi.fn(),
}))

// Update createDailyRecord test:
it('creates record with egg sub-entries', async () => {
  vi.mocked(flockQueries.findFlockById).mockResolvedValue({ id: 'f1', initialCount: 5000 } as any)
  vi.mocked(queries.insertDailyRecordWithSubTables).mockResolvedValue({ id: 'r1' } as any)

  await createDailyRecord(
    {
      flockId: 'f1',
      recordDate: new Date('2026-01-01'),
      deaths: 2,
      culled: 0,
      eggsCracked: 5,
      eggsAbnormal: 3,
      eggs: [{ stockItemId: 'egg-a', qtyButir: 1200, qtyKg: 72.5 }],
      feed: [{ stockItemId: 'feed-1', qtyUsed: 125 }],
      vaccines: [],
    },
    'user-1', 'operator'
  )
  expect(queries.insertDailyRecordWithSubTables).toHaveBeenCalledOnce()
})
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run lib/services/daily-record.service.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/db/queries/daily-record.queries.ts lib/services/daily-record.service.ts lib/services/daily-record.service.test.ts
git commit -m "feat(service): overhaul daily-record service for dynamic egg/feed/vaccine sub-tables"
```

---

## Task 10: Update stock.actions.ts and daily-record.actions.ts

**Files:**
- Modify: `lib/actions/stock.actions.ts`
- Modify: `lib/actions/daily-record.actions.ts`
- Create: `lib/actions/stock-catalog.actions.ts`

- [ ] **Step 1: Rewrite stock.actions.ts**

```typescript
// lib/actions/stock.actions.ts
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
import {
  getStockBalance,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
  createStockPurchase,
} from '@/lib/services/stock.service'
import { revalidatePath } from 'next/cache'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getStockBalanceAction(stockItemId: string): Promise<ActionResult<number>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  try {
    const balance = await getStockBalance(stockItemId)
    return { success: true, data: balance }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

const adjustmentSchema = z.object({
  stockItemId: z.string().uuid(),
  adjustmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantity: z.coerce.number().int(),
  reason: z.string().min(1),
  notes: z.string().optional(),
})

export async function createStockAdjustmentAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard
  const session = await getSession()
  const parsed = adjustmentSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }
  try {
    await createStockAdjustment(
      { ...parsed.data, adjustmentDate: new Date(parsed.data.adjustmentDate) },
      session!.id, session!.role
    )
    revalidatePath('/stok')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

const regradeSchema = z.object({
  fromItemId: z.string().uuid(),
  toItemId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  requestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
})

export async function submitRegradeRequestAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard
  const session = await getSession()
  const parsed = regradeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }
  try {
    await submitRegradeRequest(
      { ...parsed.data, requestDate: new Date(parsed.data.requestDate) },
      session!.id
    )
    revalidatePath('/stok')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

export async function approveRegradeRequestAction(requestId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const session = await getSession()
  try {
    await approveRegradeRequest(requestId, session!.id)
    revalidatePath('/stok')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

export async function rejectRegradeRequestAction(requestId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const session = await getSession()
  try {
    await rejectRegradeRequest(requestId, session!.id)
    revalidatePath('/stok')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

const purchaseSchema = z.object({
  stockItemId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
})

export async function createStockPurchaseAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard
  const session = await getSession()
  const parsed = purchaseSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }
  try {
    await createStockPurchase(
      { ...parsed.data, quantity: Math.round(parsed.data.quantity * 100), purchaseDate: new Date(parsed.data.purchaseDate) },
      session!.id
    )
    revalidatePath('/stok')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}
```

- [ ] **Step 2: Create stock-catalog.actions.ts**

```typescript
// lib/actions/stock-catalog.actions.ts
import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAdmin } from '@/lib/auth/guards'
import { createCategory, createStockItem, toggleStockItemActive } from '@/lib/services/stock-catalog.service'
import { revalidatePath } from 'next/cache'

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }

const categorySchema = z.object({
  name: z.string().min(1).max(50),
  unit: z.string().min(1).max(20),
})

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const parsed = categorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }
  try {
    await createCategory(parsed.data)
    revalidatePath('/admin/stok-katalog')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

const stockItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(50),
})

export async function createStockItemAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const parsed = stockItemSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }
  try {
    await createStockItem(parsed.data)
    revalidatePath('/admin/stok-katalog')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}

export async function toggleStockItemActiveAction(itemId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  try {
    await toggleStockItemActive(itemId)
    revalidatePath('/admin/stok-katalog')
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Error' }
  }
}
```

- [ ] **Step 3: Update daily-record.actions.ts**

Update the Zod schema and form parsing to use the new input shape. The key change is replacing `eggsGradeA`/`eggsGradeB`/`feedKg` with `eggs`/`feed`/`vaccines` JSON arrays:

```typescript
// In createDailyRecordAction, replace the schema:
const schema = z.object({
  flockId: z.string().uuid(),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deaths: z.coerce.number().int().min(0),
  culled: z.coerce.number().int().min(0),
  eggsCracked: z.coerce.number().int().min(0),
  eggsAbnormal: z.coerce.number().int().min(0),
  eggs: z.string(), // JSON string: [{stockItemId, qtyButir, qtyKg}]
  feed: z.string(), // JSON string: [{stockItemId, qtyUsed}]
  vaccines: z.string(), // JSON string: [{stockItemId, qtyUsed}]
  notes: z.string().optional(),
})

// Parse eggs/feed/vaccines from JSON:
let eggs: { stockItemId: string; qtyButir: number; qtyKg: number }[]
let feed: { stockItemId: string; qtyUsed: number }[]
let vaccines: { stockItemId: string; qtyUsed: number }[]
try {
  eggs = JSON.parse(parsed.data.eggs)
  feed = JSON.parse(parsed.data.feed)
  vaccines = JSON.parse(parsed.data.vaccines)
} catch {
  return { success: false, error: 'Format data tidak valid' }
}
```

- [ ] **Step 4: Run TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/actions/stock.actions.ts lib/actions/stock-catalog.actions.ts lib/actions/daily-record.actions.ts
git commit -m "feat(actions): update stock actions for generic inventory, add catalog actions"
```

---

## Task 11: /stok page — tab layout

**Files:**
- Modify: `app/(app)/stok/page.tsx`

- [ ] **Step 1: Rewrite /stok page with tab layout**

```typescript
// app/(app)/stok/page.tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { getCategories } from '@/lib/services/stock-catalog.service'
import Link from 'next/link'

const SYSTEM_TAB_ORDER = ['Telur', 'Pakan', 'Vaksin', 'Packaging']
const TAB_ICONS: Record<string, string> = {
  Telur: '🥚', Pakan: '🌾', Vaksin: '💉', Packaging: '📦',
}

export default async function StokPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { tab } = await searchParams
  const activeTab = tab ?? 'telur'

  const [balances, categories] = await Promise.all([
    getAllStockBalances(),
    getCategories(),
  ])

  const systemCategories = SYSTEM_TAB_ORDER
    .map(name => categories.find(c => c.name === name))
    .filter(Boolean) as typeof categories

  const otherCategories = categories.filter(
    c => !SYSTEM_TAB_ORDER.includes(c.name) && !c.isSystem
  )

  const allTabs = [
    ...systemCategories.map(c => ({ key: c.name.toLowerCase(), label: `${TAB_ICONS[c.name] ?? '📦'} ${c.name}`, category: c })),
    { key: 'lainnya', label: '➕ Lain-lain', category: null },
  ]

  const activeCategory = systemCategories.find(c => c.name.toLowerCase() === activeTab)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Stok Inventori</h1>
        {session.role !== 'operator' && (
          <div className="flex gap-2">
            <Link href="/stok/sesuaikan" className="press-feedback text-sm px-3 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn">
              Penyesuaian
            </Link>
            <Link href="/stok/regrade" className="press-feedback text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)]">
              Regrade
            </Link>
            <Link href="/stok/beli" className="press-feedback text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)]">
              Pembelian
            </Link>
          </div>
        )}
      </div>

      {/* Tab strip */}
      <div className="flex gap-0 border-b mb-6" style={{ borderColor: '#e0e8df' }}>
        {allTabs.map(t => (
          <Link
            key={t.key}
            href={`/stok?tab=${t.key}`}
            className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={activeTab === t.key
              ? { borderColor: 'var(--lf-teal)', color: 'var(--lf-teal)' }
              : { borderColor: 'transparent', color: '#8fa08f' }}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Tab content */}
      {activeCategory ? (
        <StockCategoryTable
          category={activeCategory}
          balances={balances.filter(b => b.categoryId === activeCategory.id)}
        />
      ) : (
        <OtherCategoriesContent
          categories={otherCategories}
          balances={balances}
        />
      )}
    </div>
  )
}

function StockCategoryTable({
  category,
  balances,
}: {
  category: { id: string; name: string; unit: string }
  balances: { stockItemId: string; itemName: string; balance: number }[]
}) {
  const total = balances.reduce((sum, b) => sum + b.balance, 0)
  return (
    <div>
      <div className="border border-[var(--lf-border)] rounded-xl overflow-hidden bg-white shadow-lf-sm">
        <div className="grid px-4 py-2 bg-[var(--lf-bg-card)] text-xs text-[var(--lf-text-soft)] uppercase tracking-wide font-semibold"
          style={{ gridTemplateColumns: '1fr 140px' }}>
          <span>Item</span>
          <span className="text-right">Stok ({category.unit})</span>
        </div>
        {balances.length === 0 && (
          <p className="text-center py-8 text-[var(--lf-text-soft)] text-sm">Belum ada stok</p>
        )}
        {balances.map(b => (
          <div key={b.stockItemId} className="grid px-4 py-3 border-t border-[var(--lf-border)]"
            style={{ gridTemplateColumns: '1fr 140px' }}>
            <span className="font-medium text-[var(--lf-text-dark)]">{b.itemName}</span>
            <span className="text-right font-semibold text-[var(--lf-text-dark)]">
              {b.balance.toLocaleString('id')}
            </span>
          </div>
        ))}
        {balances.length > 1 && (
          <div className="grid px-4 py-3 border-t border-[var(--lf-border)] bg-[var(--lf-bg-card)]"
            style={{ gridTemplateColumns: '1fr 140px' }}>
            <span className="font-semibold text-[var(--lf-text-dark)]">Total</span>
            <span className="text-right font-bold text-[var(--lf-blue-active)]">
              {total.toLocaleString('id')}
            </span>
          </div>
        )}
      </div>
      {category.name === 'Telur' && (
        <p className="text-xs text-[var(--lf-text-soft)] mt-2">Combined stock seluruh flock · Detail per flock tersedia di Laporan</p>
      )}
    </div>
  )
}

function OtherCategoriesContent({
  categories,
  balances,
}: {
  categories: { id: string; name: string; unit: string }[]
  balances: { stockItemId: string; itemName: string; categoryId: string; balance: number }[]
}) {
  if (categories.length === 0) {
    return <p className="text-center py-16 text-[var(--lf-text-soft)] text-sm">Belum ada kategori lainnya.</p>
  }
  return (
    <div className="grid gap-4">
      {categories.map(cat => (
        <div key={cat.id}>
          <p className="text-xs font-semibold text-[var(--lf-text-soft)] uppercase tracking-wide mb-2">{cat.name}</p>
          <StockCategoryTable
            category={cat}
            balances={balances.filter(b => b.categoryId === cat.id)}
          />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run build check**

```bash
npm run build 2>&1 | head -50
```

Fix any errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/stok/page.tsx
git commit -m "feat(ui): /stok tab layout with dynamic categories"
```

---

## Task 12: /stok/sesuaikan, /stok/regrade, /stok/beli pages

**Files:**
- Modify: `app/(app)/stok/sesuaikan/page.tsx`
- Modify: `app/(app)/stok/regrade/page.tsx`
- Modify: `app/(app)/stok/regrade/[id]/page.tsx`
- Create: `app/(app)/stok/beli/page.tsx`

- [ ] **Step 1: Update /stok/sesuaikan/page.tsx**

Replace flock dropdown with category→item cascading. This page needs to become a Client Component since it needs cascading state. Create a server page that fetches catalog data + a client form:

```typescript
// app/(app)/stok/sesuaikan/page.tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getCategories } from '@/lib/services/stock-catalog.service'
import { findItemsByCategoryId } from '@/lib/db/queries/stock-catalog.queries'
import { createStockAdjustmentAction } from '@/lib/actions/stock.actions'

export default async function SesuaikanPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'operator') redirect('/stok')

  const categories = await getCategories()

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createStockAdjustmentAction(formData)
    if (!result.success) throw new Error(result.error)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Penyesuaian Stok</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Kategori</label>
          <select name="categoryId" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm">
            <option value="">Pilih kategori...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        {/* Note: stockItemId dropdown needs client-side cascading — wire via StockAdjustmentForm client component */}
        <input type="hidden" name="stockItemId" value="" />
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Jumlah (+ tambah, - kurangi)</label>
          <input type="number" name="quantity" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Tanggal</label>
          <input type="date" name="adjustmentDate" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Alasan</label>
          <input type="text" name="reason" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg font-medium text-sm">
          Simpan
        </button>
      </form>
    </div>
  )
}
```

**Note:** Category→Item cascading requires client-side state. Extract to a `StockAdjustmentForm` client component that accepts `categories` and fetches items dynamically via an action. For MVP, a basic server-form is acceptable; the cascading dropdown can be improved in a follow-up.

- [ ] **Step 2: Update /stok/regrade/page.tsx**

Replace `grade` dropdowns with item dropdowns. Use server actions from updated `stock.actions.ts`:

```typescript
// app/(app)/stok/regrade/page.tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getActiveEggItems } from '@/lib/services/stock-catalog.service'
import { findPendingRegradeRequests } from '@/lib/db/queries/inventory.queries'
import { submitRegradeRequestAction } from '@/lib/actions/stock.actions'
import Link from 'next/link'

export default async function RegradePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'operator') redirect('/stok')

  const [eggItems, pendingRequests] = await Promise.all([
    getActiveEggItems(),
    findPendingRegradeRequests(),
  ])

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await submitRegradeRequestAction(formData)
    if (!result.success) throw new Error(result.error)
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Regrade Telur</h1>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Dari</label>
            <select name="fromItemId" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih item asal...</option>
              {eggItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Ke</label>
            <select name="toItemId" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm">
              <option value="">Pilih item tujuan...</option>
              {eggItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Jumlah (butir)</label>
            <input type="number" name="quantity" min="1" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
          </div>
          <input type="hidden" name="requestDate" value={new Date().toISOString().split('T')[0]} />
          <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg font-medium text-sm">
            Ajukan Regrade
          </button>
        </form>
      </div>

      {session.role === 'admin' && pendingRequests.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[var(--lf-text-dark)] mb-3">Menunggu Persetujuan ({pendingRequests.length})</h2>
          <div className="grid gap-2">
            {pendingRequests.map(req => (
              <div key={req.id} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{req.quantity.toLocaleString('id')} butir</p>
                  <p className="text-xs text-[var(--lf-text-soft)]">{String(req.requestDate)}</p>
                </div>
                <Link href={`/stok/regrade/${req.id}`} className="text-sm text-[var(--lf-blue)] font-medium">
                  Tinjau
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Update /stok/regrade/[id]/page.tsx**

Replace grade labels with item name lookup:

```typescript
// app/(app)/stok/regrade/[id]/page.tsx — key changes:
// 1. Import findItemById from stock-catalog.queries
// 2. Fetch fromItem and toItem names
// 3. Display "Grade A → Grade B" becomes fromItem.name → toItem.name
// 4. Keep approve/reject actions unchanged (they use requestId only)
```

- [ ] **Step 4: Create /stok/beli/page.tsx**

```typescript
// app/(app)/stok/beli/page.tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getCategories, getActiveItemsByCategory } from '@/lib/services/stock-catalog.service'
import { createStockPurchaseAction } from '@/lib/actions/stock.actions'

export default async function BeliPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'operator') redirect('/stok')

  // Exclude Telur (eggs come from production)
  const allCategories = await getCategories()
  const categories = allCategories.filter(c => c.name !== 'Telur')

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createStockPurchaseAction(formData)
    if (!result.success) throw new Error(result.error)
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Pembelian Stok</h1>
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Kategori</label>
          <select name="categoryId" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm">
            <option value="">Pilih kategori...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.unit})</option>)}
          </select>
        </div>
        <input type="hidden" name="stockItemId" value="" />
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Jumlah</label>
          <input type="number" name="quantity" min="0.01" step="0.01" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Tanggal</label>
          <input type="date" name="purchaseDate" required className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--lf-text-mid)] mb-1">Catatan</label>
          <input type="text" name="notes" className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg font-medium text-sm">
          Simpan Pembelian
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Run build check**

```bash
npm run build 2>&1 | head -60
```

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/stok/
git commit -m "feat(ui): update stok pages — sesuaikan, regrade, new beli page"
```

---

## Task 13: /admin/stok-katalog page

**Files:**
- Create: `app/(app)/admin/stok-katalog/page.tsx`
- Modify: `app/(app)/admin/page.tsx`

- [ ] **Step 1: Create stok-katalog page**

```typescript
// app/(app)/admin/stok-katalog/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/get-session'
import { getCategories, getCategoryWithItems } from '@/lib/services/stock-catalog.service'
import { createCategoryAction, createStockItemAction, toggleStockItemActiveAction } from '@/lib/actions/stock-catalog.actions'

export default async function StokKatalogPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/dashboard')

  const categories = await getCategories()
  const categoriesWithItems = await Promise.all(
    categories.map(c => getCategoryWithItems(c.id))
  )

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Katalog Stok</h1>
      </div>

      {/* Add category form */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <h2 className="font-medium text-[var(--lf-text-dark)] mb-3">Tambah Kategori Baru</h2>
        <form action={createCategoryAction} className="flex gap-2">
          <input type="text" name="name" placeholder="Nama kategori" required className="flex-1 border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
          <input type="text" name="unit" placeholder="Satuan (kg, pcs...)" required className="w-28 border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg text-sm font-medium">
            Tambah
          </button>
        </form>
      </div>

      {/* Category list */}
      {categoriesWithItems.map(({ category, items }) => (
        <div key={category.id} className="bg-white rounded-xl shadow-lf-sm border border-[var(--lf-border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--lf-border)] flex items-center gap-2">
            <span className="font-semibold text-[var(--lf-text-dark)]">{category.name}</span>
            <span className="text-xs text-[var(--lf-text-soft)]">({category.unit})</span>
            {category.isSystem && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">System</span>}
          </div>
          <div>
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2 border-b border-[var(--lf-border)] last:border-0">
                <span className={`text-sm ${item.isActive ? 'text-[var(--lf-text-dark)]' : 'text-[var(--lf-text-soft)] line-through'}`}>
                  {item.name}
                </span>
                <form action={toggleStockItemActiveAction.bind(null, item.id)}>
                  <button type="submit" className="text-xs text-[var(--lf-text-soft)] hover:text-[var(--lf-blue)]">
                    {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </form>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-[var(--lf-border)]">
            <form action={createStockItemAction} className="flex gap-2">
              <input type="hidden" name="categoryId" value={category.id} />
              <input type="text" name="name" placeholder="Nama item baru..." required className="flex-1 border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
              <button type="submit" className="px-3 py-2 border border-[var(--lf-border)] rounded-lg text-sm text-[var(--lf-text-mid)]">
                + Tambah
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add link in /admin/page.tsx**

Add a Katalog Stok link card alongside existing admin menu items in `app/(app)/admin/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/admin/stok-katalog/ app/\(app\)/admin/page.tsx
git commit -m "feat(ui): add /admin/stok-katalog catalog management page"
```

---

## Task 14: Overhaul daily-input-form — 4-tab UI

**Files:**
- Modify: `components/forms/daily-input-form.tsx`
- Modify: `app/(app)/produksi/input/page.tsx`

- [ ] **Step 1: Update produksi/input/page.tsx to pass catalog items**

```typescript
// app/(app)/produksi/input/page.tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { getFlockOptionsForInput } from '@/lib/services/daily-record.service'
import { getActiveEggItems, getActiveFeedItems, getActiveVaccineItems } from '@/lib/services/stock-catalog.service'
import { getAllStockBalances } from '@/lib/db/queries/inventory.queries'
import { DailyInputForm } from '@/components/forms/daily-input-form'

export default async function ProduksiInputPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [flocks, eggItems, feedItems, vaccineItems, balances] = await Promise.all([
    getFlockOptionsForInput(session.id, session.role),
    getActiveEggItems(),
    getActiveFeedItems(),
    getActiveVaccineItems(),
    getAllStockBalances(),
  ])

  const balanceMap = new Map(balances.map(b => [b.stockItemId, b.balance]))

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Input Produksi Harian</h1>
      <DailyInputForm
        flocks={flocks}
        userRole={session.role}
        eggItems={eggItems}
        feedItems={feedItems.map(i => ({ ...i, currentStock: balanceMap.get(i.id) ?? 0 }))}
        vaccineItems={vaccineItems.map(i => ({ ...i, currentStock: balanceMap.get(i.id) ?? 0 }))}
      />
    </div>
  )
}
```

- [ ] **Step 2: Rewrite daily-input-form.tsx with 4-tab layout**

This is a significant rewrite. Key changes:
- `'use client'` — needs tab state, form state
- Props: add `eggItems`, `feedItems` (with currentStock), `vaccineItems` (with currentStock)
- Remove `eggsGradeA`/`eggsGradeB`/`feedKg`/`avgWeightKg` from FormValues
- Add `activeTab` state (`'ayam' | 'telur' | 'pakan' | 'vaksin'`)
- Tab Ayam: deaths, culled, notes fields
- Tab Telur: dynamic rows per eggItem (qtyButir + qtyKg)
- Tab Pakan: dynamic rows per feedItem (qtyUsed + currentStock display)
- Tab Vaksin: dynamic rows per vaccineItem (qtyUsed + currentStock display)
- On submit: serialize eggs/feed/vaccines as JSON, POST via `createDailyRecordAction`

```typescript
'use client'
// client: tab state, dynamic form rows, sessionStorage persistence

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/services/daily-record.service'
import type { StockItem } from '@/lib/db/schema'

type FeedVaccineItem = StockItem & { currentStock: number }

type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
  eggItems: StockItem[]
  feedItems: FeedVaccineItem[]
  vaccineItems: FeedVaccineItem[]
}

type EggValues = Record<string, { qtyButir: string; qtyKg: string }>
type UsageValues = Record<string, string>

type FormState = {
  flockId: string
  recordDate: string
  deaths: string
  culled: string
  eggsCracked: string
  eggsAbnormal: string
  notes: string
  eggs: EggValues
  feed: UsageValues
  vaccines: UsageValues
}

export function DailyInputForm({ flocks, userRole, eggItems, feedItems, vaccineItems }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ayam' | 'telur' | 'pakan' | 'vaksin'>('ayam')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]!

  const [form, setForm] = useState<FormState>({
    flockId: flocks[0]?.id ?? '',
    recordDate: today,
    deaths: '0',
    culled: '0',
    eggsCracked: '0',
    eggsAbnormal: '0',
    notes: '',
    eggs: Object.fromEntries(eggItems.map(i => [i.id, { qtyButir: '0', qtyKg: '0' }])),
    feed: Object.fromEntries(feedItems.map(i => [i.id, '0'])),
    vaccines: Object.fromEntries(vaccineItems.map(i => [i.id, '0'])),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const fd = new FormData()
    fd.set('flockId', form.flockId)
    fd.set('recordDate', form.recordDate)
    fd.set('deaths', form.deaths)
    fd.set('culled', form.culled)
    fd.set('eggsCracked', form.eggsCracked)
    fd.set('eggsAbnormal', form.eggsAbnormal)
    fd.set('notes', form.notes)
    fd.set('eggs', JSON.stringify(
      eggItems.map(i => ({
        stockItemId: i.id,
        qtyButir: Number(form.eggs[i.id]?.qtyButir ?? 0),
        qtyKg: Number(form.eggs[i.id]?.qtyKg ?? 0),
      }))
    ))
    fd.set('feed', JSON.stringify(
      feedItems.map(i => ({ stockItemId: i.id, qtyUsed: Number(form.feed[i.id] ?? 0) }))
    ))
    fd.set('vaccines', JSON.stringify(
      vaccineItems.map(i => ({ stockItemId: i.id, qtyUsed: Number(form.vaccines[i.id] ?? 0) }))
    ))

    const result = await createDailyRecordAction(fd)
    setSubmitting(false)
    if (!result.success) {
      setError(result.error)
    } else {
      router.push('/produksi')
    }
  }

  const tabs = [
    { key: 'ayam' as const, label: '🐓 Ayam' },
    { key: 'telur' as const, label: '🥚 Telur' },
    { key: 'pakan' as const, label: '🌾 Pakan' },
    { key: 'vaksin' as const, label: '💉 Vaksin' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Flock + date header */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-[var(--lf-text-soft)] uppercase tracking-wide mb-1">Flock</label>
          <select value={form.flockId} onChange={e => setForm(f => ({ ...f, flockId: e.target.value }))}
            className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm">
            {flocks.map(f => <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--lf-text-soft)] uppercase tracking-wide mb-1">Tanggal</label>
          <input type="date" value={form.recordDate}
            onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))}
            className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b" style={{ borderColor: '#e0e8df' }}>
        {tabs.map(t => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={activeTab === t.key
              ? { borderColor: 'var(--lf-teal)', color: 'var(--lf-teal)' }
              : { borderColor: 'transparent', color: '#8fa08f' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Ayam */}
      {activeTab === 'ayam' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--lf-text-soft)] uppercase tracking-wide mb-1">Kematian (ekor)</label>
              <input type="number" min="0" value={form.deaths}
                onChange={e => setForm(f => ({ ...f, deaths: e.target.value }))}
                className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[var(--lf-text-soft)] uppercase tracking-wide mb-1">Afkir (ekor)</label>
              <input type="number" min="0" value={form.culled}
                onChange={e => setForm(f => ({ ...f, culled: e.target.value }))}
                className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[var(--lf-text-soft)] uppercase tracking-wide mb-1">Catatan</label>
            <textarea value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm" rows={3} />
          </div>
        </div>
      )}

      {/* Tab: Telur */}
      {activeTab === 'telur' && (
        <div>
          <div className="border border-[var(--lf-border)] rounded-xl overflow-hidden">
            <div className="grid px-4 py-2 bg-[var(--lf-bg-card)] text-xs text-[var(--lf-text-soft)] uppercase tracking-wide font-semibold"
              style={{ gridTemplateColumns: '1fr 100px 100px' }}>
              <span>SKU</span><span className="text-right">Butir</span><span className="text-right">Kg</span>
            </div>
            {eggItems.map(item => (
              <div key={item.id} className="grid px-4 py-2 border-t border-[var(--lf-border)] items-center gap-2"
                style={{ gridTemplateColumns: '1fr 100px 100px' }}>
                <span className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</span>
                <input type="number" min="0" value={form.eggs[item.id]?.qtyButir ?? '0'}
                  onChange={e => setForm(f => ({ ...f, eggs: { ...f.eggs, [item.id]: { ...f.eggs[item.id]!, qtyButir: e.target.value } } }))}
                  className="border border-[var(--lf-border)] rounded-lg px-2 py-1 text-sm text-right" />
                <input type="number" min="0" step="0.1" value={form.eggs[item.id]?.qtyKg ?? '0'}
                  onChange={e => setForm(f => ({ ...f, eggs: { ...f.eggs, [item.id]: { ...f.eggs[item.id]!, qtyKg: e.target.value } } }))}
                  className="border border-[var(--lf-border)] rounded-lg px-2 py-1 text-sm text-right" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Pakan */}
      {activeTab === 'pakan' && (
        <div>
          {feedItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4 text-center">Belum ada item pakan aktif.</p>}
          <div className="border border-[var(--lf-border)] rounded-xl overflow-hidden">
            {feedItems.map(item => (
              <div key={item.id} className="grid px-4 py-2 border-b border-[var(--lf-border)] last:border-0 items-center gap-2"
                style={{ gridTemplateColumns: '1fr 120px' }}>
                <div>
                  <p className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</p>
                  <p className="text-xs" style={{ color: item.currentStock > 0 ? '#4caf50' : '#e05' }}>
                    Stok: {item.currentStock.toLocaleString('id')} kg
                  </p>
                </div>
                <input type="number" min="0" step="0.1" value={form.feed[item.id] ?? '0'}
                  onChange={e => setForm(f => ({ ...f, feed: { ...f.feed, [item.id]: e.target.value } }))}
                  className="border border-[var(--lf-border)] rounded-lg px-2 py-1 text-sm text-right" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Vaksin */}
      {activeTab === 'vaksin' && (
        <div>
          {vaccineItems.length === 0 && <p className="text-sm text-[var(--lf-text-soft)] py-4 text-center">Belum ada item vaksin aktif.</p>}
          <div className="border border-[var(--lf-border)] rounded-xl overflow-hidden">
            {vaccineItems.map(item => (
              <div key={item.id} className="grid px-4 py-2 border-b border-[var(--lf-border)] last:border-0 items-center gap-2"
                style={{ gridTemplateColumns: '1fr 120px' }}>
                <div>
                  <p className="text-sm font-medium text-[var(--lf-text-dark)]">{item.name}</p>
                  <p className="text-xs" style={{ color: item.currentStock > 0 ? '#4caf50' : '#e05' }}>
                    Stok: {item.currentStock.toLocaleString('id')} dosis
                  </p>
                </div>
                <input type="number" min="0" step="0.1" value={form.vaccines[item.id] ?? '0'}
                  onChange={e => setForm(f => ({ ...f, vaccines: { ...f.vaccines, [item.id]: e.target.value } }))}
                  className="border border-[var(--lf-border)] rounded-lg px-2 py-1 text-sm text-right" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full py-3 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-xl font-medium text-sm shadow-lf-btn disabled:opacity-60">
        {submitting ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  )
}
```

- [ ] **Step 3: Run TypeScript check and build**

```bash
npx tsc --noEmit && npm run build 2>&1 | head -60
```

- [ ] **Step 4: Commit**

```bash
git add components/forms/daily-input-form.tsx app/\(app\)/produksi/input/page.tsx
git commit -m "feat(ui): overhaul daily-input-form to 4-tab layout with dynamic egg/feed/vaccine SKUs"
```

---

## Task 15: Fix downstream breakage — dashboard, laporan, edit form

**Files:**
- Modify: `lib/db/queries/dashboard.queries.ts`
- Modify: `lib/services/dashboard.service.ts`
- Modify: `app/(app)/produksi/[id]/edit/edit-form.tsx`
- Modify: `lib/services/lock-period.service.ts`
- Modify: `lib/services/import.service.ts`

- [ ] **Step 1: Update dashboard.queries.ts**

`DashboardRecord` and `getStockSummary` reference removed columns. Fix:

```typescript
// Update DashboardRecord — remove eggsGradeA, eggsGradeB, feedKg
export type DashboardRecord = Pick<
  DailyRecord,
  'id' | 'flockId' | 'recordDate' | 'deaths' | 'culled' | 'isLateInput'
>

// Update getStockSummary — query from inventory_movements grouped by stockItemId
// For MVP: return totalEggs as sum of all Telur category movements
export async function getStockSummary(): Promise<{ totalEggs: number }> {
  // Join inventoryMovements → stockItems → stockCategories WHERE category = 'Telur'
  // SUM IN - SUM OUT
  const rows = await db
    .select({
      total: sql<number>`SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END)`,
    })
    .from(inventoryMovements)
    .innerJoin(stockItems, eq(inventoryMovements.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(eq(stockCategories.name, 'Telur'))
  return { totalEggs: Number(rows[0]?.total ?? 0) }
}
```

- [ ] **Step 2: Update dashboard.service.ts**

`getDashboardKpis` uses `eggsGradeA`/`eggsGradeB` from `DashboardRecord`. Update to use `daily_egg_records` totals instead, or sum from inventory movements. For MVP:

```typescript
// In getDashboardKpis: productionToday and stockReadyToSell
// productionToday: sum qtyButir from daily_egg_records for today across all flocks
// stockReadyToSell: from getStockSummary().totalEggs
```

Adjust `DashboardKpis` and `getProductionChartData` — remove `gradeA`/`gradeB` fields that come from `DashboardRecord`, or replace with total from `daily_egg_records`. Mark as TODO if it requires significant redesign of the charts.

- [ ] **Step 3: Update lock-period.service.ts**

Remove `eggsGradeA`, `eggsGradeB`, `feedKg`, `avgWeightKg` from `DailyRecordPatch`:

```typescript
type DailyRecordPatch = {
  deaths?: number
  culled?: number
  eggsCracked?: number
  eggsAbnormal?: number
  notes?: string
}
```

Also update `correctDailyRecord` — remove the compensating inventory movement logic for egg grade changes (those now live in `daily_egg_records`). Correction records for egg changes will need a separate flow in the future; for now, throw error if user attempts to correct egg sub-records (out of scope for this plan).

- [ ] **Step 4: Update edit-form.tsx**

Remove `eggsGradeA`, `eggsGradeB`, `feedKg`, `avgWeightKg` fields. Keep deaths, culled, eggsCracked, eggsAbnormal, notes.

- [ ] **Step 5: Update import.service.ts**

`parseDailyRecordsCsv` and `parseOpeningStockCsv` reference removed columns. For `parseDailyRecordsCsv`, remove `eggs_grade_a`/`eggs_grade_b`/`feed_kg`/`avg_weight_kg` columns. For `parseOpeningStockCsv`, replace `grade` with `stock_item_id`.

- [ ] **Step 6: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix all remaining type errors.

- [ ] **Step 7: Run tests**

```bash
npx vitest run
```

Fix failing tests.

- [ ] **Step 8: Commit**

```bash
git add lib/db/queries/dashboard.queries.ts lib/services/dashboard.service.ts lib/services/lock-period.service.ts app/\(app\)/produksi/\[id\]/ lib/services/import.service.ts
git commit -m "fix: update dashboard, lock-period, edit form, import service for new schema"
```

---

## Task 16: Final build and verification

- [ ] **Step 1: Clean build**

```bash
npm run build
```

Expected: no TypeScript errors, no build failures.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Run dev server and test golden paths**

```bash
npm run dev
```

Test in browser:
1. Navigate to `/stok` → verify 5 tabs render, Telur tab shows combined balance
2. Navigate to `/stok/beli` → fill form → submit → verify `/stok` balance increases
3. Navigate to `/stok/sesuaikan` → adjust stock → verify balance changes
4. Navigate to `/stok/regrade` → submit regrade request
5. As admin: approve regrade → verify movements in DB via Drizzle Studio
6. Navigate to `/produksi/input` → fill all 4 tabs → submit → verify `daily_egg_records`, `daily_feed_records`, `daily_vaccine_records` rows in DB
7. Navigate to `/admin/stok-katalog` → add new category → add item → verify it appears in produksi form

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: generic inventory system — complete implementation"
```
