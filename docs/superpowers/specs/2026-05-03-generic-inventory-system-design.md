# Generic Inventory System Design

**Date:** 2026-05-03  
**Status:** Approved  
**Scope:** Replace hardcoded egg grade inventory with a flexible multi-category stock system. Overhaul daily record input to support dynamic SKUs for eggs, feed, and vaccines.

---

## Context

The current inventory system only tracks egg stock (Grade A & B) per flock. `inventory_movements.grade` is a hardcoded `enum('A','B')`. Adding any new stock type requires schema migrations and code changes.

The farm needs to track: eggs, feed, vaccines, live chickens, packaging, and user-defined items. This design replaces the hardcoded model with a catalog-based system where admins define categories and SKUs from the UI — no code changes needed to add new stock types.

Additionally, the daily production input form is overhauled to support dynamic egg SKUs and to directly deduct feed/vaccine stock on save.

---

## Decisions

| Question | Decision |
|----------|----------|
| Stock model | Catalog + SKU (stock_categories + stock_items) |
| Variants | Yes — each category has named items (SKUs) |
| Egg stock scope | Farm-level combined (not per-flock in UI) |
| Non-egg scope | Farm-level pool |
| flockId in movements | Retained for audit/reports, not shown in /stok UI |
| Catalog management | Admin only |
| Data migration | Truncate all inventory tables (data is dummy) |
| Regrade scope | Farm-level (drop flockId from regrade_requests) |
| Daily record | Overhauled — 3 new sub-tables, 4-tab UI |
| Feed/vaccine input | Auto-creates OUT movement on daily record save |
| Egg units | Per SKU: qtyButir + qtyKg |
| eggsCracked/Abnormal | Remain as waste metrics in daily_records, not tracked as inventory |
| requiresFlock flag | Removed — not needed in new model |

---

## 1. Data Model

### 1.1 New Tables

#### `stock_categories`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
name          text NOT NULL UNIQUE          -- "Telur", "Pakan", "Vaksin", "Ayam Hidup", "Packaging"
unit          text NOT NULL                 -- "butir", "kg", "dosis", "ekor", "pcs"
isSystem      boolean NOT NULL DEFAULT false -- true = built-in, cannot delete
createdAt     timestamp NOT NULL DEFAULT now()
```

Seed data (isSystem=true):
- Telur (butir)
- Pakan (kg)
- Vaksin (dosis)
- Ayam Hidup (ekor)
- Packaging (pcs)

#### `stock_items`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
categoryId  uuid NOT NULL REFERENCES stock_categories(id)
name        text NOT NULL                  -- "Grade A", "Grade B", "Layer Starter", …
isActive    boolean NOT NULL DEFAULT true
createdAt   timestamp NOT NULL DEFAULT now()
UNIQUE(categoryId, name)
```

Seed data:
- Telur / Grade A, Grade B
- Pakan / Layer Starter, Layer Finisher
- Vaksin / Newcastle, Avian Influenza
- Ayam Hidup / Produksi
- Packaging / Karton 30

#### `daily_egg_records`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
dailyRecordId   uuid NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE
stockItemId     uuid NOT NULL REFERENCES stock_items(id)   -- category must be Telur
qtyButir        integer NOT NULL DEFAULT 0 CHECK(qtyButir >= 0)
qtyKg           numeric(8,2) NOT NULL DEFAULT 0 CHECK(qtyKg >= 0)
UNIQUE(dailyRecordId, stockItemId)
```

#### `daily_feed_records`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
dailyRecordId   uuid NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE
stockItemId     uuid NOT NULL REFERENCES stock_items(id)   -- category must be Pakan
qtyUsed         numeric(8,2) NOT NULL CHECK(qtyUsed >= 0)
UNIQUE(dailyRecordId, stockItemId)
```

#### `daily_vaccine_records`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
dailyRecordId   uuid NOT NULL REFERENCES daily_records(id) ON DELETE CASCADE
stockItemId     uuid NOT NULL REFERENCES stock_items(id)   -- category must be Vaksin
qtyUsed         numeric(8,2) NOT NULL CHECK(qtyUsed >= 0)
UNIQUE(dailyRecordId, stockItemId)
```

---

### 1.2 Modified Tables

#### `daily_records` — columns dropped
```sql
-- DROP:
eggsGradeA    integer
eggsGradeB    integer
feedKg        numeric
avgWeightKg   numeric

-- KEEP (waste metrics, not inventory):
eggsCracked   integer
eggsAbnormal  integer

-- KEEP (ayam tab):
deaths        integer
culled        integer
notes         text
```

#### `inventory_movements` — columns changed
```sql
-- DROP:
grade         enum('A','B')

-- ADD:
stockItemId   uuid NOT NULL REFERENCES stock_items(id)
-- flockId: already exists, now NULLABLE (was NOT NULL for eggs)

-- source enum ADD:
'purchase'    -- for buying feed/vaccine/packaging stock

-- sourceType enum ADD:
'daily_egg_records'
'daily_feed_records'
'daily_vaccine_records'
```

#### `stock_adjustments` — columns changed
```sql
-- DROP:
grade         enum('A','B')

-- ADD:
stockItemId   uuid NOT NULL REFERENCES stock_items(id)
-- flockId: make NULLABLE
```

#### `regrade_requests` — columns changed
```sql
-- DROP:
gradeFrom     enum('A','B')
gradeTo       enum('A','B')
flockId       uuid  -- regrade is now farm-level

-- ADD:
fromItemId    uuid NOT NULL REFERENCES stock_items(id)
toItemId      uuid NOT NULL REFERENCES stock_items(id)
-- Validation: fromItemId.categoryId === toItemId.categoryId
```

#### `inventory_snapshots`
Drop entirely — was only a nightly cache, never used for live balance. Live balance always computed from `inventory_movements`.

---

### 1.3 Migration Plan

Since all inventory data is dummy (app not yet in production):

```sql
-- Step 1: Truncate all inventory tables
TRUNCATE inventory_movements, inventory_snapshots, stock_adjustments, regrade_requests CASCADE;

-- Step 2: Drop inventory_snapshots
DROP TABLE inventory_snapshots;

-- Step 3: Add new tables (stock_categories, stock_items, daily_egg_records, daily_feed_records, daily_vaccine_records)

-- Step 4: Alter inventory_movements, stock_adjustments, regrade_requests, daily_records

-- Step 5: Seed stock_categories + stock_items
```

All in one Drizzle migration file following the project's `db:generate` → `db:migrate` workflow.

---

## 2. Service Layer

### 2.1 New: `lib/services/stock-catalog.service.ts`

```ts
getCategories(): Promise<StockCategory[]>
getCategoryWithItems(categoryId: string): Promise<{ category: StockCategory; items: StockItem[] }>
getActiveItemsByCategory(categoryId: string): Promise<StockItem[]>
getActiveEggItems(): Promise<StockItem[]>        // shorthand for Telur category
getActiveFeedItems(): Promise<StockItem[]>       // shorthand for Pakan category
getActiveVaccineItems(): Promise<StockItem[]>    // shorthand for Vaksin category
createCategory(input: CreateCategoryInput, adminId: string): Promise<StockCategory>
createStockItem(input: CreateStockItemInput, adminId: string): Promise<StockItem>
toggleStockItemActive(itemId: string, adminId: string): Promise<void>
```

Admin-only. Called by `/admin/stok-katalog`.

### 2.2 Refactored: `lib/services/stock.service.ts`

```ts
// Balance queries
getStockBalance(stockItemId: string, flockId?: string): Promise<number>
getAllStockBalances(): Promise<StockBalance[]>
// StockBalance: { stockItemId, categoryId, categoryName, itemName, unit, balance }

// Mutations (unchanged logic, updated field names)
createStockAdjustment(input: StockAdjustmentInput, userId: string, role: Role): Promise<void>
submitRegradeRequest(input: RegradeInput, userId: string): Promise<void>
approveRegradeRequest(requestId: string, adminId: string): Promise<void>
rejectRegradeRequest(requestId: string, adminId: string): Promise<void>

// New
createStockPurchase(input: StockPurchaseInput, userId: string): Promise<void>
// source: 'purchase', movementType: 'in'
```

### 2.3 Refactored: `lib/services/daily-record.service.ts`

```ts
saveDailyRecord(input: DailyRecordInput, userId: string): Promise<void>
```

Single transaction:
1. Upsert `daily_records` (deaths, culled, notes, eggsCracked, eggsAbnormal)
2. Delete + reinsert `daily_egg_records[]` → create IN movements per egg SKU (flockId from record)
3. Delete + reinsert `daily_feed_records[]` → create OUT movements per feed item
4. Delete + reinsert `daily_vaccine_records[]` → create OUT movements per vaccine item

Validation before save:
- Feed qty ≤ current feed stock balance
- Vaccine qty ≤ current vaccine stock balance

---

## 3. Query Layer

### `lib/db/queries/inventory.queries.ts` — key changes

```ts
// Balance: GROUP BY stockItemId, no more hardcoded 'A'|'B'
getStockBalance(stockItemId: string): Promise<number>
getAllStockBalances(): Promise<{ stockItemId: string; balance: number }[]>

// No more getStockBalance(flockId, grade) signature
```

---

## 4. UI

### 4.1 `/stok` — Redesigned

Tab-based layout (URL state: `?tab=telur|pakan|vaksin|packaging|lainnya`). Default tab: telur.

**Tab order:** 🥚 Telur | 🌾 Pakan | 💉 Vaksin | 📦 Packaging | ➕ Lain-lain

**Header actions (all tabs):** Penyesuaian | Regrade | Pembelian

**Tab Telur:** Simple SKU list — item name + stock quantity (butir). Total row at bottom. No per-flock breakdown. Note: "Detail per flock tersedia di Laporan".

**Tab Pakan/Vaksin/Packaging/Lain-lain:** Item name + balance (with unit). Farm-level pool.

**Tab Lain-lain:** Groups all user-defined categories (non-system) by category name.

### 4.2 `/stok/sesuaikan` — Updated

Form: Category dropdown → Item dropdown (cascading) → Qty (±) → Date → Reason → Notes.  
No flock dropdown — adjustments are farm-level for all types.

### 4.3 `/stok/regrade` — Updated

Form: From Item dropdown → To Item dropdown (same category enforced) → Qty → Notes.  
No flock dropdown. Approval flow unchanged.

### 4.4 `/stok/beli` — New

Form: Category → Item → Qty → Date → Notes.  
For non-egg categories only (eggs enter via production).  
Creates `inventory_movement` with `source: 'purchase'`, `movementType: 'in'`.

### 4.5 `/admin/stok-katalog` — New

Admin-only. List of categories with their items. Actions:
- Add category (name + unit)
- Add item to category
- Toggle item active/inactive (cannot delete if has movements)
- Cannot delete system categories

### 4.6 `/produksi/input` — Overhauled

Flock + date in header (always visible). Then 4 tabs:

**Tab 🐓 Ayam:** deaths, culled, notes.

**Tab 🥚 Telur:** Dynamic rows from `getActiveEggItems()`. Each row: SKU name | butir input | kg input. Running total shown below.

**Tab 🌾 Pakan:** Dynamic rows from `getActiveFeedItems()`. Each row: item name + current stock (read-only) | qty used input. Validation: qty ≤ stock.

**Tab 💉 Vaksin:** Dynamic rows from `getActiveVaccineItems()`. Same layout as Pakan.

Single "Simpan" button saves all tabs in one transaction.

---

## 5. Roles & Access

| Feature | Operator | Supervisor | Admin |
|---------|----------|------------|-------|
| View /stok | ✓ | ✓ | ✓ |
| Penyesuaian | ✗ | ✓ | ✓ |
| Regrade (submit) | ✗ | ✓ | ✓ |
| Regrade (approve) | ✗ | ✗ | ✓ |
| Pembelian | ✗ | ✓ | ✓ |
| Katalog management | ✗ | ✗ | ✓ |
| Input produksi harian | ✓ (own coop) | ✓ | ✓ |

---

## 6. Files to Create / Modify

### New files
- `lib/db/schema/stock-categories.ts`
- `lib/db/schema/stock-items.ts`
- `lib/db/schema/daily-egg-records.ts`
- `lib/db/schema/daily-feed-records.ts`
- `lib/db/schema/daily-vaccine-records.ts`
- `lib/services/stock-catalog.service.ts`
- `lib/db/queries/stock-catalog.queries.ts`
- `app/(app)/stok/beli/page.tsx`
- `app/(app)/admin/stok-katalog/page.tsx`
- `components/forms/stock-purchase-form.tsx`
- `components/forms/stock-catalog-form.tsx`
- `lib/db/migrations/<timestamp>_generic_inventory.sql`

### Modified files
- `lib/db/schema/inventory-movements.ts` — drop grade, add stockItemId, nullable flockId
- `lib/db/schema/stock-adjustments.ts` — drop grade, add stockItemId, nullable flockId
- `lib/db/schema/regrade-requests.ts` — drop gradeFrom/gradeTo/flockId, add fromItemId/toItemId
- `lib/db/schema/daily-records.ts` — drop eggsGradeA/B/feedKg/avgWeightKg
- `lib/db/queries/inventory.queries.ts` — rewrite balance queries
- `lib/services/stock.service.ts` — refactor all grade refs to stockItemId
- `lib/services/daily-record.service.ts` — overhaul saveDailyRecord
- `lib/actions/stock.actions.ts` — update types
- `lib/actions/daily-record.actions.ts` — update types
- `app/(app)/stok/page.tsx` — tab layout
- `app/(app)/stok/sesuaikan/page.tsx` — cascading dropdowns
- `app/(app)/stok/regrade/page.tsx` — item dropdowns, no flock
- `app/(app)/stok/regrade/[id]/page.tsx` — item names instead of grade labels
- `app/(app)/produksi/input/page.tsx` — 4-tab form
- `components/forms/daily-input-form.tsx` — 4-tab UI, dynamic fields
- `components/forms/stock-adjustment-form.tsx` — cascading dropdowns
- `components/forms/regrade-form.tsx` — item dropdowns

### Deleted files
- `lib/db/schema/inventory-snapshots.ts`

---

## 7. Verification

1. **Schema:** Run `npm run db:generate` → review SQL → `npm run db:migrate`. Confirm no unintended DROP TABLE.
2. **Seed:** Verify 5 categories + seed items appear in `npm run db:studio`.
3. **Daily record:** Input produksi harian → check `daily_egg_records`, `daily_feed_records`, `daily_vaccine_records` rows created. Check `inventory_movements` rows created with correct `stockItemId` and `flockId`.
4. **Stock balance:** `/stok` Tab Telur shows combined balance. Tab Pakan shows reduced balance after daily record save.
5. **Regrade:** Submit regrade Grade A → Grade B. Approve. Check two movements (out A, in B). `/stok` Tab Telur reflects new balances.
6. **Penyesuaian:** Category → Item cascading works. Adjustment creates movement. Balance updates.
7. **Pembelian:** `/stok/beli` creates IN movement. Stok pakan/vaksin naik.
8. **Admin katalog:** Add new category + item. Verify it appears in form dropdowns.
9. **Role guards:** Operator cannot access penyesuaian/regrade/beli/katalog pages.
