# Phase 2 Production Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Sprint 2 (daily production input), Sprint 3 (inventory ledger), and Sprint 4 (dashboard KPI + charts with mock data).

**Architecture:** 3-layer (actions → services → queries); `inventory_movements` is the append-only source of truth; all business logic in services, unit-tested with vitest + vi.mock; dashboard uses static mock data until real queries are wired.

**Tech Stack:** Next.js 15 App Router, Drizzle ORM v0.45, Supabase PostgreSQL, Recharts (dynamic import, ssr:false), Zod, vitest.

---

## File Map

**Create:**
- `lib/db/schema/daily-records.ts`
- `lib/db/schema/inventory-movements.ts`
- `lib/db/schema/inventory-snapshots.ts`
- `lib/db/schema/stock-adjustments.ts`
- `lib/db/schema/regrade-requests.ts`
- `lib/db/queries/daily-record.queries.ts`
- `lib/db/queries/inventory.queries.ts`
- `lib/services/daily-record.service.ts` + `daily-record.service.test.ts`
- `lib/services/stock.service.ts` + `stock.service.test.ts`
- `lib/actions/daily-record.actions.ts`
- `lib/actions/stock.actions.ts`
- `lib/mock/dashboard.mock.ts`
- `components/forms/daily-input-form.tsx`
- `components/ui/kpi-card.tsx`
- `components/ui/charts/hdp-line-chart.tsx`
- `components/ui/charts/fcr-line-chart.tsx`
- `components/ui/charts/production-bar-chart.tsx`
- `components/ui/charts/depletion-area-chart.tsx`
- `app/(app)/produksi/input/page.tsx`
- `app/(app)/stok/sesuaikan/page.tsx`
- `app/(app)/stok/regrade/page.tsx`
- `app/(app)/stok/regrade/[id]/page.tsx`

**Modify:**
- `lib/db/schema/index.ts` — add 5 new exports
- `app/(app)/produksi/page.tsx` — last-7-records table
- `app/(app)/stok/page.tsx` — stock balance display
- `app/(app)/dashboard/page.tsx` — KPI grid + charts + data table

---

## Task 1: Sprint 2 DB Schemas

**Files:**
- Create: `lib/db/schema/daily-records.ts`
- Create: `lib/db/schema/inventory-movements.ts`
- Create: `lib/db/schema/inventory-snapshots.ts`

- [ ] **Step 1: Create `lib/db/schema/daily-records.ts`**

```ts
import { pgTable, uuid, integer, date, timestamp, boolean, numeric, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const dailyRecords = pgTable('daily_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  recordDate: date('record_date', { mode: 'date' }).notNull(),
  deaths: integer('deaths').notNull().default(0),
  culled: integer('culled').notNull().default(0),
  eggsGradeA: integer('eggs_grade_a').notNull().default(0),
  eggsGradeB: integer('eggs_grade_b').notNull().default(0),
  eggsCracked: integer('eggs_cracked').notNull().default(0),
  eggsAbnormal: integer('eggs_abnormal').notNull().default(0),
  avgWeightKg: numeric('avg_weight_kg', { precision: 10, scale: 3 }),
  feedKg: numeric('feed_kg', { precision: 10, scale: 3 }),
  isLateInput: boolean('is_late_input').notNull().default(false),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
}, (table) => [
  uniqueIndex('daily_records_flock_date_unique').on(table.flockId, table.recordDate),
])

export type DailyRecord = typeof dailyRecords.$inferSelect
export type NewDailyRecord = typeof dailyRecords.$inferInsert
```

- [ ] **Step 2: Create `lib/db/schema/inventory-movements.ts`**

```ts
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  movementType: text('movement_type', { enum: ['IN', 'OUT'] }).notNull(),
  grade: text('grade', { enum: ['A', 'B'] }).notNull(),
  quantity: integer('quantity').notNull(), // always positive; direction from movementType
  referenceType: text('reference_type'), // 'daily_record' | 'stock_adjustment' | 'regrade'
  referenceId: uuid('reference_id'),
  note: text('note'),
  movementDate: date('movement_date', { mode: 'date' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert
```

- [ ] **Step 3: Create `lib/db/schema/inventory-snapshots.ts`**

```ts
import { pgTable, uuid, integer, date, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'

export const inventorySnapshots = pgTable('inventory_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  snapshotDate: date('snapshot_date', { mode: 'date' }).notNull(),
  gradeAQty: integer('grade_a_qty').notNull().default(0),
  gradeBQty: integer('grade_b_qty').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('inventory_snapshots_flock_date_unique').on(table.flockId, table.snapshotDate),
])

export type InventorySnapshot = typeof inventorySnapshots.$inferSelect
export type NewInventorySnapshot = typeof inventorySnapshots.$inferInsert
```

- [ ] **Step 4: Commit**

```bash
git add lib/db/schema/daily-records.ts lib/db/schema/inventory-movements.ts lib/db/schema/inventory-snapshots.ts
git commit -m "feat(db): add Sprint 2 schemas — daily_records, inventory_movements, inventory_snapshots"
```

---

## Task 2: Sprint 3 DB Schemas + index + db:push

**Files:**
- Create: `lib/db/schema/stock-adjustments.ts`
- Create: `lib/db/schema/regrade-requests.ts`
- Modify: `lib/db/schema/index.ts`

- [ ] **Step 1: Create `lib/db/schema/stock-adjustments.ts`**

```ts
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const stockAdjustments = pgTable('stock_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  adjustmentDate: date('adjustment_date', { mode: 'date' }).notNull(),
  grade: text('grade', { enum: ['A', 'B'] }).notNull(),
  quantity: integer('quantity').notNull(), // signed: positive = add, negative = remove
  reason: text('reason').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type StockAdjustment = typeof stockAdjustments.$inferSelect
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert
```

- [ ] **Step 2: Create `lib/db/schema/regrade-requests.ts`**

```ts
import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const regradeRequests = pgTable('regrade_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  gradeFrom: text('grade_from', { enum: ['A', 'B'] }).notNull(),
  gradeTo: text('grade_to', { enum: ['A', 'B'] }).notNull(),
  quantity: integer('quantity').notNull(), // always positive
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).notNull().default('PENDING'),
  requestDate: date('request_date', { mode: 'date' }).notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type RegradeRequest = typeof regradeRequests.$inferSelect
export type NewRegradeRequest = typeof regradeRequests.$inferInsert
```

- [ ] **Step 3: Update `lib/db/schema/index.ts`**

```ts
export * from './users'
export * from './coops'
export * from './flocks'
export * from './flock-phases'
export * from './customers'
export * from './user-coop-assignments'
export * from './daily-records'
export * from './inventory-movements'
export * from './inventory-snapshots'
export * from './stock-adjustments'
export * from './regrade-requests'
```

- [ ] **Step 4: Push all schemas to Supabase**

```bash
npm run db:push
```

Expected: Drizzle creates `daily_records`, `inventory_movements`, `inventory_snapshots`, `stock_adjustments`, `regrade_requests` tables in Supabase. Confirm in Supabase dashboard or `npm run db:studio`.

- [ ] **Step 5: Commit**

```bash
git add lib/db/schema/stock-adjustments.ts lib/db/schema/regrade-requests.ts lib/db/schema/index.ts
git commit -m "feat(db): add Sprint 3 schemas — stock_adjustments, regrade_requests; push all to Supabase"
```

---

## Task 3: daily-record.queries.ts

**Files:**
- Create: `lib/db/queries/daily-record.queries.ts`

- [ ] **Step 1: Create the file**

```ts
import { db } from '@/lib/db'
import { dailyRecords, inventoryMovements } from '@/lib/db/schema'
import { eq, and, desc, sum } from 'drizzle-orm'
import type { DailyRecord, NewDailyRecord, NewInventoryMovement } from '@/lib/db/schema'

export async function findDailyRecord(flockId: string, recordDate: Date): Promise<DailyRecord | null> {
  const [record] = await db
    .select()
    .from(dailyRecords)
    .where(and(eq(dailyRecords.flockId, flockId), eq(dailyRecords.recordDate, recordDate)))
    .limit(1)
  return record ?? null
}

export async function findRecentDailyRecords(flockId: string, limit: number): Promise<DailyRecord[]> {
  return db
    .select()
    .from(dailyRecords)
    .where(eq(dailyRecords.flockId, flockId))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
}

export async function getTotalDepletionByFlock(
  flockId: string
): Promise<{ deaths: number; culled: number }> {
  const [row] = await db
    .select({ totalDeaths: sum(dailyRecords.deaths), totalCulled: sum(dailyRecords.culled) })
    .from(dailyRecords)
    .where(eq(dailyRecords.flockId, flockId))
  return {
    deaths: Number(row?.totalDeaths ?? '0'),
    culled: Number(row?.totalCulled ?? '0'),
  }
}

export async function insertDailyRecordWithMovements(
  record: NewDailyRecord,
  movements: NewInventoryMovement[]
): Promise<DailyRecord> {
  return db.transaction(async (tx) => {
    const [inserted] = await tx.insert(dailyRecords).values(record).returning()
    if (movements.length > 0) {
      await tx.insert(inventoryMovements).values(movements)
    }
    return inserted!
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/queries/daily-record.queries.ts
git commit -m "feat(db): add daily-record queries — find, depletion sum, tx insert with movements"
```

---

## Task 4: daily-record.service.ts — pure functions (TDD)

**Files:**
- Create: `lib/services/daily-record.service.test.ts`
- Create: `lib/services/daily-record.service.ts`

- [ ] **Step 1: Write failing tests for pure functions**

Create `lib/services/daily-record.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/daily-record.queries', () => ({
  findDailyRecord: vi.fn(),
  insertDailyRecordWithMovements: vi.fn(),
}))

import {
  validateBackdate,
  computeIsLateInput,
  computeActivePopulation,
  computeHDP,
  computeFeedPerBird,
  computeFCR,
} from './daily-record.service'

describe('daily-record.service — pure functions', () => {
  describe('validateBackdate', () => {
    it('operator cannot backdate more than 1 day', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-19'), now, 'operator')).toThrow()
    })

    it('operator can input H-1', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-20'), now, 'operator')).not.toThrow()
    })

    it('supervisor can backdate up to 3 days', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-18'), now, 'supervisor')).not.toThrow()
    })

    it('supervisor cannot backdate more than 3 days', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-17'), now, 'supervisor')).toThrow()
    })

    it('admin can backdate unlimited', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2025-01-01'), now, 'admin')).not.toThrow()
    })

    it('rejects future date for all roles', () => {
      const now = new Date('2026-04-21')
      expect(() => validateBackdate(new Date('2026-04-22'), now, 'admin')).toThrow()
    })
  })

  describe('computeIsLateInput', () => {
    it('returns false when submitted before midnight UTC on record date', () => {
      expect(computeIsLateInput(new Date('2026-04-20'), new Date('2026-04-20T22:00:00Z'))).toBe(false)
    })

    it('returns true when submitted on next calendar day', () => {
      expect(computeIsLateInput(new Date('2026-04-20'), new Date('2026-04-21T00:01:00Z'))).toBe(true)
    })
  })

  describe('computeActivePopulation', () => {
    it('subtracts total deaths and culled from initial count', () => {
      expect(computeActivePopulation(1000, [{ deaths: 5, culled: 2 }, { deaths: 3, culled: 0 }])).toBe(990)
    })

    it('returns 0 when depletion exceeds initial count', () => {
      expect(computeActivePopulation(10, [{ deaths: 15, culled: 0 }])).toBe(0)
    })
  })

  describe('computeHDP', () => {
    it('calculates egg lay rate correctly', () => {
      expect(computeHDP(850, 50, 1000)).toBeCloseTo(90)
    })

    it('returns 0 when population is 0', () => {
      expect(computeHDP(100, 50, 0)).toBe(0)
    })
  })

  describe('computeFCR', () => {
    it('calculates kg feed per dozen eggs', () => {
      // 12 kg feed, 120 eggs = 10 dozen → 1.2
      expect(computeFCR(12, 120, 0)).toBeCloseTo(1.2)
    })

    it('returns 0 when no eggs produced', () => {
      expect(computeFCR(10, 0, 0)).toBe(0)
    })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test -- daily-record.service
```

Expected: FAIL — `validateBackdate` is not exported / module not found.

- [ ] **Step 3: Implement pure functions in `lib/services/daily-record.service.ts`**

```ts
import {
  findDailyRecord,
  insertDailyRecordWithMovements,
} from '@/lib/db/queries/daily-record.queries'
import type { DailyRecord, NewDailyRecord, NewInventoryMovement } from '@/lib/db/schema'

type Role = 'operator' | 'supervisor' | 'admin'

export function validateBackdate(recordDate: Date, now: Date, role: Role): void {
  if (recordDate > now) throw new Error('Tidak dapat input untuk tanggal masa depan')
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const diffDays = Math.round((nowDay - recDay) / 86_400_000)
  const max = role === 'operator' ? 1 : role === 'supervisor' ? 3 : Infinity
  if (diffDays > max) {
    const limit = role === 'operator' ? 'H-1' : 'H-3'
    throw new Error(`Input hanya diizinkan sampai ${limit} untuk role ini`)
  }
}

export function computeIsLateInput(recordDate: Date, submittedAt: Date): boolean {
  const endOfDay = new Date(recordDate)
  endOfDay.setUTCHours(23, 59, 59, 999)
  return submittedAt > endOfDay
}

export function computeActivePopulation(
  initialCount: number,
  records: { deaths: number; culled: number }[]
): number {
  const depletion = records.reduce((acc, r) => acc + r.deaths + r.culled, 0)
  return Math.max(0, initialCount - depletion)
}

export function computeHDP(eggsA: number, eggsB: number, population: number): number {
  if (population <= 0) return 0
  return ((eggsA + eggsB) / population) * 100
}

export function computeFeedPerBird(feedKg: number, population: number): number {
  if (population <= 0) return 0
  return (feedKg / population) * 1000 // grams per bird
}

export function computeFCR(feedKg: number, eggsA: number, eggsB: number): number {
  const total = eggsA + eggsB
  if (total <= 0) return 0
  return feedKg / (total / 12) // kg feed per dozen eggs; threshold >2.1 = inefficient
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test -- daily-record.service
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/daily-record.service.ts lib/services/daily-record.service.test.ts
git commit -m "feat(service): daily-record pure functions — validateBackdate, computeHDP, computeFCR, etc. (TDD)"
```

---

## Task 5: daily-record.service.ts — createDailyRecord (TDD)

**Files:**
- Modify: `lib/services/daily-record.service.test.ts`
- Modify: `lib/services/daily-record.service.ts`

- [ ] **Step 1: Add createDailyRecord tests to the test file**

Append to `lib/services/daily-record.service.test.ts` (inside the outer `describe` block after the pure-function describes):

```ts
import * as queries from '@/lib/db/queries/daily-record.queries'
import { createDailyRecord } from './daily-record.service'

describe('createDailyRecord', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws when record already exists for that date', async () => {
    vi.mocked(queries.findDailyRecord).mockResolvedValue({ id: 'existing' } as any) // any: partial mock

    await expect(
      createDailyRecord(
        { flockId: 'f1', recordDate: new Date('2026-04-20'), deaths: 0, culled: 0, eggsGradeA: 100, eggsGradeB: 10, eggsCracked: 0, eggsAbnormal: 0 },
        'user-1', 'operator', new Date('2026-04-21')
      )
    ).rejects.toThrow('Data untuk tanggal ini sudah ada')
  })

  it('inserts record with IN movements for grade A and B', async () => {
    vi.mocked(queries.findDailyRecord).mockResolvedValue(null)
    vi.mocked(queries.insertDailyRecordWithMovements).mockResolvedValue({ id: 'r1' } as any)

    await createDailyRecord(
      { flockId: 'f1', recordDate: new Date('2026-04-20'), deaths: 2, culled: 0, eggsGradeA: 900, eggsGradeB: 50, eggsCracked: 0, eggsAbnormal: 0 },
      'user-1', 'operator', new Date('2026-04-21')
    )

    expect(queries.insertDailyRecordWithMovements).toHaveBeenCalledWith(
      expect.objectContaining({ flockId: 'f1', eggsGradeA: 900 }),
      expect.arrayContaining([
        expect.objectContaining({ grade: 'A', quantity: 900, movementType: 'IN' }),
        expect.objectContaining({ grade: 'B', quantity: 50, movementType: 'IN' }),
      ])
    )
  })

  it('sets isLateInput true when submitted next calendar day', async () => {
    vi.mocked(queries.findDailyRecord).mockResolvedValue(null)
    vi.mocked(queries.insertDailyRecordWithMovements).mockResolvedValue({ id: 'r1' } as any)

    await createDailyRecord(
      { flockId: 'f1', recordDate: new Date('2026-04-20'), deaths: 0, culled: 0, eggsGradeA: 100, eggsGradeB: 0, eggsCracked: 0, eggsAbnormal: 0 },
      'user-1', 'operator', new Date('2026-04-21T00:01:00Z')
    )

    expect(queries.insertDailyRecordWithMovements).toHaveBeenCalledWith(
      expect.objectContaining({ isLateInput: true }),
      expect.any(Array)
    )
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL on createDailyRecord tests**

```bash
npm run test -- daily-record.service
```

Expected: 3 new tests FAIL — `createDailyRecord is not a function`.

- [ ] **Step 3: Implement createDailyRecord — append to `lib/services/daily-record.service.ts`**

```ts
type CreateDailyRecordInput = {
  flockId: string
  recordDate: Date
  deaths: number
  culled: number
  eggsGradeA: number
  eggsGradeB: number
  eggsCracked: number
  eggsAbnormal: number
  avgWeightKg?: number
  feedKg?: number
}

export async function createDailyRecord(
  input: CreateDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
  validateBackdate(input.recordDate, now, role)

  const existing = await findDailyRecord(input.flockId, input.recordDate)
  if (existing) throw new Error('Data untuk tanggal ini sudah ada')

  const isLateInput = computeIsLateInput(input.recordDate, now)

  const record: NewDailyRecord = {
    flockId: input.flockId,
    recordDate: input.recordDate,
    deaths: input.deaths,
    culled: input.culled,
    eggsGradeA: input.eggsGradeA,
    eggsGradeB: input.eggsGradeB,
    eggsCracked: input.eggsCracked,
    eggsAbnormal: input.eggsAbnormal,
    avgWeightKg: input.avgWeightKg != null ? input.avgWeightKg : null,
    feedKg: input.feedKg != null ? input.feedKg : null,
    isLateInput,
    createdBy: userId,
  }

  const movements: NewInventoryMovement[] = []
  if (input.eggsGradeA > 0) {
    movements.push({
      flockId: input.flockId,
      movementType: 'IN',
      grade: 'A',
      quantity: input.eggsGradeA,
      referenceType: 'daily_record',
      movementDate: input.recordDate,
      createdBy: userId,
    })
  }
  if (input.eggsGradeB > 0) {
    movements.push({
      flockId: input.flockId,
      movementType: 'IN',
      grade: 'B',
      quantity: input.eggsGradeB,
      referenceType: 'daily_record',
      movementDate: input.recordDate,
      createdBy: userId,
    })
  }

  return insertDailyRecordWithMovements(record, movements)
}
```

- [ ] **Step 4: Run all tests — expect all PASS**

```bash
npm run test -- daily-record.service
```

Expected: All 13 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/daily-record.service.ts lib/services/daily-record.service.test.ts
git commit -m "feat(service): createDailyRecord — backdate validation, duplicate guard, atomic tx insert (TDD)"
```

---

## Task 6: daily-record.actions.ts

**Files:**
- Create: `lib/actions/daily-record.actions.ts`

- [ ] **Step 1: Create the file**

```ts
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { createDailyRecord } from '@/lib/services/daily-record.service'
import { findRecentDailyRecords, getTotalDepletionByFlock } from '@/lib/db/queries/daily-record.queries'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'

const dailyRecordSchema = z.object({
  flockId: z.string().uuid('Flock tidak valid'),
  recordDate: z.coerce.date(),
  deaths: z.coerce.number().int().min(0),
  culled: z.coerce.number().int().min(0),
  eggsGradeA: z.coerce.number().int().min(0),
  eggsGradeB: z.coerce.number().int().min(0),
  eggsCracked: z.coerce.number().int().min(0),
  eggsAbnormal: z.coerce.number().int().min(0),
  avgWeightKg: z.coerce.number().optional(),
  feedKg: z.coerce.number().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = dailyRecordSchema.safeParse({
    flockId: formData.get('flockId'),
    recordDate: formData.get('recordDate'),
    deaths: formData.get('deaths'),
    culled: formData.get('culled'),
    eggsGradeA: formData.get('eggsGradeA'),
    eggsGradeB: formData.get('eggsGradeB'),
    eggsCracked: formData.get('eggsCracked'),
    eggsAbnormal: formData.get('eggsAbnormal'),
    avgWeightKg: formData.get('avgWeightKg') || undefined,
    feedKg: formData.get('feedKg') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const record = await createDailyRecord(parsed.data, session.id, session.role)
    return { success: true, data: { id: record.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data produksi' }
  }
}

export type FlockOption = {
  id: string
  name: string
  coopName: string
  initialCount: number
  currentPopulation: number
}

export async function getFlockOptionsForInputAction(): Promise<ActionResult<FlockOption[]>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    let flocks = await findAllActiveFlocks()
    if (session.role === 'operator') {
      const coopIds = new Set(await findAssignedCoopIds(session.id))
      flocks = flocks.filter((f) => coopIds.has(f.coopId))
    }
    const options = await Promise.all(
      flocks.map(async (f) => {
        const dep = await getTotalDepletionByFlock(f.id)
        return {
          id: f.id,
          name: f.name,
          coopName: f.coopName,
          initialCount: f.initialCount,
          currentPopulation: Math.max(0, f.initialCount - dep.deaths - dep.culled),
        }
      })
    )
    return { success: true, data: options }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/daily-record.actions.ts
git commit -m "feat(action): daily-record server actions — createDailyRecord, getFlockOptions (coop-filtered)"
```

---

## Task 7: daily-input-form.tsx

**Files:**
- Create: `components/forms/daily-input-form.tsx`

- [ ] **Step 1: Create the component**

Note: `computeHDP`, `computeFeedPerBird`, `computeFCR` are duplicated here from the service because client bundles cannot import from service files (which transitively pull in postgres/drizzle Node.js modules).
// USED BY: [daily-record.service, daily-input-form] — count: 2

```tsx
'use client'
// client: live auto-calc with useMemo + sessionStorage persistence

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createDailyRecordAction } from '@/lib/actions/daily-record.actions'
import type { FlockOption } from '@/lib/actions/daily-record.actions'

// USED BY: [daily-record.service, daily-input-form] — count: 2
function calcHDP(a: number, b: number, pop: number) {
  return pop > 0 ? ((a + b) / pop) * 100 : 0
}
function calcFeedPerBird(feedKg: number, pop: number) {
  return pop > 0 ? (feedKg / pop) * 1000 : 0
}
function calcFCR(feedKg: number, a: number, b: number) {
  const total = a + b
  return total > 0 ? feedKg / (total / 12) : 0
}

type Props = {
  flocks: FlockOption[]
  userRole: 'operator' | 'supervisor' | 'admin'
}

type FormValues = {
  flockId: string
  recordDate: string
  deaths: string
  culled: string
  eggsGradeA: string
  eggsGradeB: string
  eggsCracked: string
  eggsAbnormal: string
  avgWeightKg: string
  feedKg: string
}

const SESSION_KEY = 'daily-input-form'

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]!
}

function minDate(role: 'operator' | 'supervisor' | 'admin'): string {
  const days = role === 'operator' ? 1 : role === 'supervisor' ? 3 : 365
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]!
}

function empty(flockId: string): FormValues {
  return {
    flockId,
    recordDate: todayUTC(),
    deaths: '0',
    culled: '0',
    eggsGradeA: '0',
    eggsGradeB: '0',
    eggsCracked: '0',
    eggsAbnormal: '0',
    avgWeightKg: '',
    feedKg: '',
  }
}

const inputClass =
  'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[#fafaf9] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

export function DailyInputForm({ flocks, userRole }: Props) {
  const router = useRouter()
  const defaultFlockId = flocks[0]?.id ?? ''
  const [values, setValues] = useState<FormValues>(empty(defaultFlockId))
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) {
      try { setValues(JSON.parse(saved) as FormValues) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(values))
  }, [values])

  const flock = flocks.find((f) => f.id === values.flockId)

  const calc = useMemo(() => {
    const d = parseInt(values.deaths) || 0
    const c = parseInt(values.culled) || 0
    const a = parseInt(values.eggsGradeA) || 0
    const b = parseInt(values.eggsGradeB) || 0
    const feed = parseFloat(values.feedKg) || 0
    const pop = Math.max(0, (flock?.currentPopulation ?? 0) - d - c)
    return { totalDepletion: d + c, activePopulation: pop, hdp: calcHDP(a, b, pop), feedPerBird: calcFeedPerBird(feed, pop), fcr: calcFCR(feed, a, b) }
  }, [values, flock])

  function field(k: keyof FormValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((p) => ({ ...p, [k]: e.target.value }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => fd.append(k, v))
      const result = await createDailyRecordAction(fd)
      if (!result.success) {
        setError(result.error)
      } else {
        sessionStorage.removeItem(SESSION_KEY)
        router.push('/produksi')
        router.refresh()
      }
    } finally {
      setPending(false)
    }
  }

  if (flocks.length === 0) {
    return <p className="text-[var(--lf-text-soft)]">Tidak ada flock aktif yang tersedia.</p>
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Flock + Date */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select name="flockId" value={values.flockId} onChange={field('flockId')} className={inputClass} required>
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal Produksi</label>
          <input type="date" name="recordDate" value={values.recordDate} onChange={field('recordDate')}
            max={todayUTC()} min={minDate(userRole)} className={inputClass} required />
        </div>
      </div>

      {/* Depletion */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Depletion</p>
        <div className="grid grid-cols-2 gap-3">
          {([['deaths', 'Kematian'], ['culled', 'Sortir']] as [keyof FormValues, string][]).map(([k, lbl]) => (
            <div key={k}>
              <label className="text-xs text-[var(--lf-text-mid)]">{lbl}</label>
              <input type="number" name={k} min="0" value={values[k]} onChange={field(k)} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* Eggs */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Telur</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            ['eggsGradeA', 'Grade A'],
            ['eggsGradeB', 'Grade B'],
            ['eggsCracked', 'Retak'],
            ['eggsAbnormal', 'Abnormal'],
          ] as [keyof FormValues, string][]).map(([k, lbl]) => (
            <div key={k}>
              <label className="text-xs text-[var(--lf-text-mid)]">{lbl}</label>
              <input type="number" name={k} min="0" value={values[k]} onChange={field(k)} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {/* Feed + Weight */}
      <div className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Pakan & Bobot</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-[var(--lf-text-mid)]">Pakan (kg)</label>
            <input type="number" name="feedKg" min="0" step="0.01" value={values.feedKg} onChange={field('feedKg')} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-[var(--lf-text-mid)]">Rata-rata bobot (kg)</label>
            <input type="number" name="avgWeightKg" min="0" step="0.001" value={values.avgWeightKg} onChange={field('avgWeightKg')} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Auto-calc */}
      <div className="bg-[var(--lf-blue-pale)] rounded-xl p-4 border border-[#bbd5ee]">
        <p className="text-xs font-medium text-[var(--lf-blue-active)] uppercase tracking-wide mb-3">Kalkulasi Otomatis</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <span className="text-[var(--lf-text-mid)]">Depletion hari ini</span>
          <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.totalDepletion}</span>
          <span className="text-[var(--lf-text-mid)]">Populasi aktif</span>
          <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.activePopulation.toLocaleString('id')}</span>
          <span className="text-[var(--lf-text-mid)]">HDP%</span>
          <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.hdp.toFixed(1)}%</span>
          {values.feedKg && (
            <>
              <span className="text-[var(--lf-text-mid)]">Pakan/ekor</span>
              <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.feedPerBird.toFixed(0)} g</span>
              <span className="text-[var(--lf-text-mid)]">FCR</span>
              <span className="font-medium text-right text-[var(--lf-text-dark)]">{calc.fcr.toFixed(2)}</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-[#fdeeed] text-[#e07a6a] rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn disabled:opacity-60"
      >
        {pending ? 'Menyimpan...' : 'Simpan Data Produksi'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/forms/daily-input-form.tsx
git commit -m "feat(ui): DailyInputForm — live auto-calc, sessionStorage restore, coop-aware flock dropdown"
```

---

## Task 8: produksi pages

**Files:**
- Create: `app/(app)/produksi/input/page.tsx`
- Modify: `app/(app)/produksi/page.tsx`

- [ ] **Step 1: Create `app/(app)/produksi/input/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { getTotalDepletionByFlock } from '@/lib/db/queries/daily-record.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { DailyInputForm } from '@/components/forms/daily-input-form'

export default async function ProduksiInputPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  let rawFlocks = await findAllActiveFlocks()
  if (session.role === 'operator') {
    const coopIds = new Set(await findAssignedCoopIds(session.id))
    rawFlocks = rawFlocks.filter((f) => coopIds.has(f.coopId))
  }

  const flocks = await Promise.all(
    rawFlocks.map(async (f) => {
      const dep = await getTotalDepletionByFlock(f.id)
      return {
        id: f.id,
        name: f.name,
        coopName: f.coopName,
        initialCount: f.initialCount,
        currentPopulation: Math.max(0, f.initialCount - dep.deaths - dep.culled),
      }
    })
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Input Produksi Harian</h1>
      <DailyInputForm flocks={flocks} userRole={session.role} />
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/(app)/produksi/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findRecentDailyRecords } from '@/lib/db/queries/daily-record.queries'
import Link from 'next/link'

export default async function ProduksiPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const flocks = await findAllActiveFlocks()
  // Show records for first flock; full multi-flock view is a later enhancement
  const firstFlock = flocks[0]
  const records = firstFlock ? await findRecentDailyRecords(firstFlock.id, 7) : []

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Produksi</h1>
        <Link
          href="/produksi/input"
          className="text-sm px-4 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn"
        >
          + Input Harian
        </Link>
      </div>

      {records.length === 0 ? (
        <p className="text-[var(--lf-text-soft)] text-center py-16">Belum ada data produksi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-1">
            <thead>
              <tr className="text-xs text-[var(--lf-text-soft)] uppercase tracking-wide text-left">
                <th className="px-3 py-2">Tanggal</th>
                <th className="px-3 py-2 text-right">Grade A</th>
                <th className="px-3 py-2 text-right">Grade B</th>
                <th className="px-3 py-2 text-right">Kematian</th>
                <th className="px-3 py-2 text-right">Pakan (kg)</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="bg-white rounded-xl shadow-lf-sm">
                  <td className="px-3 py-3 rounded-l-xl font-medium text-[var(--lf-text-dark)]">
                    {new Date(r.recordDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    {r.isLateInput && (
                      <span className="ml-2 text-[10px] bg-[#fdeeed] text-[#e07a6a] rounded px-1.5 py-0.5">Terlambat</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-[var(--lf-text-dark)]">{r.eggsGradeA.toLocaleString('id')}</td>
                  <td className="px-3 py-3 text-right text-[var(--lf-text-dark)]">{r.eggsGradeB.toLocaleString('id')}</td>
                  <td className="px-3 py-3 text-right text-[var(--lf-text-mid)]">{r.deaths}</td>
                  <td className="px-3 py-3 text-right text-[var(--lf-text-mid)] rounded-r-xl">
                    {r.feedKg != null ? Number(r.feedKg).toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Start dev server, navigate to `/produksi` and `/produksi/input`, verify render**

```bash
npm run dev
```

Check:
- `/produksi` renders table (or empty state)
- `/produksi/input` renders the form with flock dropdown and live calc section
- Changing numbers in form updates auto-calc immediately

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/produksi/input/page.tsx app/\(app\)/produksi/page.tsx
git commit -m "feat(page): produksi — daily input form page + last-7-records table with late-input badge"
```

---

## Task 9: inventory.queries.ts

**Files:**
- Create: `lib/db/queries/inventory.queries.ts`

- [ ] **Step 1: Create the file**

```ts
import { db } from '@/lib/db'
import { inventoryMovements, stockAdjustments, regradeRequests } from '@/lib/db/schema'
import { eq, and, desc, sum } from 'drizzle-orm'
import type {
  InventoryMovement, NewInventoryMovement,
  StockAdjustment, NewStockAdjustment,
  RegradeRequest, NewRegradeRequest,
} from '@/lib/db/schema'

export async function getStockBalance(flockId: string, grade: 'A' | 'B'): Promise<number> {
  const [inRow] = await db
    .select({ total: sum(inventoryMovements.quantity) })
    .from(inventoryMovements)
    .where(and(eq(inventoryMovements.flockId, flockId), eq(inventoryMovements.grade, grade), eq(inventoryMovements.movementType, 'IN')))
  const [outRow] = await db
    .select({ total: sum(inventoryMovements.quantity) })
    .from(inventoryMovements)
    .where(and(eq(inventoryMovements.flockId, flockId), eq(inventoryMovements.grade, grade), eq(inventoryMovements.movementType, 'OUT')))
  return Number(inRow?.total ?? '0') - Number(outRow?.total ?? '0')
}

export async function findStockMovements(flockId: string, limit: number): Promise<InventoryMovement[]> {
  return db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.flockId, flockId))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(limit)
}

export async function insertStockAdjustmentWithMovement(
  adjustment: NewStockAdjustment,
  movement: NewInventoryMovement
): Promise<StockAdjustment> {
  return db.transaction(async (tx) => {
    const [adj] = await tx.insert(stockAdjustments).values(adjustment).returning()
    await tx.insert(inventoryMovements).values({ ...movement, referenceId: adj!.id })
    return adj!
  })
}

export async function findPendingRegradeRequests(): Promise<RegradeRequest[]> {
  return db
    .select()
    .from(regradeRequests)
    .where(eq(regradeRequests.status, 'PENDING'))
    .orderBy(desc(regradeRequests.createdAt))
}

export async function findRegradeRequestById(id: string): Promise<RegradeRequest | null> {
  const [req] = await db.select().from(regradeRequests).where(eq(regradeRequests.id, id)).limit(1)
  return req ?? null
}

export async function insertRegradeRequest(data: NewRegradeRequest): Promise<RegradeRequest> {
  const [req] = await db.insert(regradeRequests).values(data).returning()
  return req!
}

export async function updateRegradeRequestStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  reviewedBy: string
): Promise<void> {
  await db
    .update(regradeRequests)
    .set({ status, reviewedBy, reviewedAt: new Date() })
    .where(eq(regradeRequests.id, id))
}

export async function approveRegradeRequestTx(requestId: string, reviewedBy: string): Promise<void> {
  const request = await findRegradeRequestById(requestId)
  if (!request) throw new Error('Not found')

  await db.transaction(async (tx) => {
    await tx
      .update(regradeRequests)
      .set({ status: 'APPROVED', reviewedBy, reviewedAt: new Date() })
      .where(eq(regradeRequests.id, requestId))

    await tx.insert(inventoryMovements).values({
      flockId: request.flockId,
      movementType: 'OUT',
      grade: request.gradeFrom,
      quantity: request.quantity,
      referenceType: 'regrade',
      referenceId: requestId,
      movementDate: new Date(),
      createdBy: reviewedBy,
    })

    await tx.insert(inventoryMovements).values({
      flockId: request.flockId,
      movementType: 'IN',
      grade: request.gradeTo,
      quantity: request.quantity,
      referenceType: 'regrade',
      referenceId: requestId,
      movementDate: new Date(),
      createdBy: reviewedBy,
    })
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/db/queries/inventory.queries.ts
git commit -m "feat(db): inventory queries — stock balance, adjustments, regrade approval tx"
```

---

## Task 10: stock.service.ts (TDD)

**Files:**
- Create: `lib/services/stock.service.test.ts`
- Create: `lib/services/stock.service.ts`

- [ ] **Step 1: Write failing tests**

Create `lib/services/stock.service.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalance: vi.fn(),
  findStockMovements: vi.fn(),
  insertStockAdjustmentWithMovement: vi.fn(),
  findPendingRegradeRequests: vi.fn(),
  findRegradeRequestById: vi.fn(),
  insertRegradeRequest: vi.fn(),
  updateRegradeRequestStatus: vi.fn(),
  approveRegradeRequestTx: vi.fn(),
}))

import * as q from '@/lib/db/queries/inventory.queries'
import {
  validateStockNotBelowZero,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
} from './stock.service'

describe('stock.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('validateStockNotBelowZero', () => {
    it('throws when adjustment makes stock negative', () => {
      expect(() => validateStockNotBelowZero(100, -101)).toThrow('Stok tidak mencukupi')
    })

    it('allows adjustment to exactly zero', () => {
      expect(() => validateStockNotBelowZero(100, -100)).not.toThrow()
    })
  })

  describe('createStockAdjustment', () => {
    it('checks balance before negative adjustment', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(500)
      vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any)

      await createStockAdjustment(
        { flockId: 'f1', adjustmentDate: new Date(), grade: 'A', quantity: -30, reason: 'Koreksi' },
        'user-1'
      )

      expect(q.getStockBalance).toHaveBeenCalledWith('f1', 'A')
      expect(q.insertStockAdjustmentWithMovement).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: -30 }),
        expect.objectContaining({ movementType: 'OUT', quantity: 30 })
      )
    })

    it('throws when negative adjustment exceeds balance', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(20)

      await expect(
        createStockAdjustment(
          { flockId: 'f1', adjustmentDate: new Date(), grade: 'A', quantity: -50, reason: 'Koreksi' },
          'user-1'
        )
      ).rejects.toThrow('Stok tidak mencukupi')
    })

    it('skips balance check for positive adjustment', async () => {
      vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any)

      await createStockAdjustment(
        { flockId: 'f1', adjustmentDate: new Date(), grade: 'A', quantity: 100, reason: 'Tambah stok' },
        'user-1'
      )

      expect(q.getStockBalance).not.toHaveBeenCalled()
    })
  })

  describe('submitRegradeRequest', () => {
    it('checks source grade balance', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(1000)
      vi.mocked(q.insertRegradeRequest).mockResolvedValue({ id: 'rr-1' } as any)

      await submitRegradeRequest(
        { flockId: 'f1', gradeFrom: 'A', gradeTo: 'B', quantity: 200, requestDate: new Date() },
        'user-1'
      )

      expect(q.getStockBalance).toHaveBeenCalledWith('f1', 'A')
    })

    it('throws when source grade has insufficient stock', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(100)

      await expect(
        submitRegradeRequest(
          { flockId: 'f1', gradeFrom: 'A', gradeTo: 'B', quantity: 500, requestDate: new Date() },
          'user-1'
        )
      ).rejects.toThrow('Stok tidak mencukupi')
    })
  })

  describe('approveRegradeRequest', () => {
    it('throws when request not found', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue(null)
      await expect(approveRegradeRequest('req-1', 'admin-1')).rejects.toThrow('tidak ditemukan')
    })

    it('throws when request already processed', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'APPROVED' } as any)
      await expect(approveRegradeRequest('req-1', 'admin-1')).rejects.toThrow('sudah diproses')
    })

    it('calls approveRegradeRequestTx for pending requests', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'PENDING' } as any)
      vi.mocked(q.approveRegradeRequestTx).mockResolvedValue(undefined)

      await approveRegradeRequest('req-1', 'admin-1')

      expect(q.approveRegradeRequestTx).toHaveBeenCalledWith('req-1', 'admin-1')
    })
  })

  describe('rejectRegradeRequest', () => {
    it('throws when request not found', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue(null)
      await expect(rejectRegradeRequest('req-1', 'admin-1')).rejects.toThrow('tidak ditemukan')
    })

    it('updates status to REJECTED', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'PENDING' } as any)
      vi.mocked(q.updateRegradeRequestStatus).mockResolvedValue(undefined)

      await rejectRegradeRequest('req-1', 'admin-1')

      expect(q.updateRegradeRequestStatus).toHaveBeenCalledWith('req-1', 'REJECTED', 'admin-1')
    })
  })
})
```

- [ ] **Step 2: Run — expect FAIL**

```bash
npm run test -- stock.service
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `lib/services/stock.service.ts`**

```ts
import {
  getStockBalance as _getStockBalance,
  insertStockAdjustmentWithMovement,
  findPendingRegradeRequests,
  findRegradeRequestById,
  insertRegradeRequest,
  updateRegradeRequestStatus,
  approveRegradeRequestTx,
} from '@/lib/db/queries/inventory.queries'
import type { StockAdjustment, RegradeRequest } from '@/lib/db/schema'

export { _getStockBalance as getStockBalance }

export function validateStockNotBelowZero(currentBalance: number, quantity: number): void {
  if (currentBalance + quantity < 0) throw new Error('Stok tidak mencukupi untuk operasi ini')
}

type AdjustmentInput = {
  flockId: string
  adjustmentDate: Date
  grade: 'A' | 'B'
  quantity: number // signed
  reason: string
  notes?: string
}

export async function createStockAdjustment(
  input: AdjustmentInput,
  userId: string
): Promise<StockAdjustment> {
  if (input.quantity < 0) {
    const balance = await _getStockBalance(input.flockId, input.grade)
    validateStockNotBelowZero(balance, input.quantity)
  }
  const movementType = input.quantity >= 0 ? 'IN' : 'OUT'
  const qty = Math.abs(input.quantity)
  return insertStockAdjustmentWithMovement(
    { ...input, createdBy: userId },
    {
      flockId: input.flockId,
      movementType,
      grade: input.grade,
      quantity: qty,
      referenceType: 'stock_adjustment',
      movementDate: input.adjustmentDate,
      createdBy: userId,
    }
  )
}

type RegradeInput = {
  flockId: string
  gradeFrom: 'A' | 'B'
  gradeTo: 'A' | 'B'
  quantity: number
  requestDate: Date
  notes?: string
}

export async function submitRegradeRequest(
  input: RegradeInput,
  userId: string
): Promise<RegradeRequest> {
  const balance = await _getStockBalance(input.flockId, input.gradeFrom)
  validateStockNotBelowZero(balance, -input.quantity)
  return insertRegradeRequest({ ...input, status: 'PENDING', createdBy: userId })
}

export async function approveRegradeRequest(requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(requestId)
  if (!req) throw new Error('Permintaan regrade tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Permintaan sudah diproses')
  await approveRegradeRequestTx(requestId, adminId)
}

export async function rejectRegradeRequest(requestId: string, adminId: string): Promise<void> {
  const req = await findRegradeRequestById(requestId)
  if (!req) throw new Error('Permintaan regrade tidak ditemukan')
  if (req.status !== 'PENDING') throw new Error('Permintaan sudah diproses')
  await updateRegradeRequestStatus(requestId, 'REJECTED', adminId)
}

export async function getPendingRegradeRequests(): Promise<RegradeRequest[]> {
  return findPendingRegradeRequests()
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
npm run test -- stock.service
```

Expected: All 11 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/services/stock.service.ts lib/services/stock.service.test.ts
git commit -m "feat(service): stock service — adjustment, regrade submit/approve/reject with balance guards (TDD)"
```

---

## Task 11: stock.actions.ts

**Files:**
- Create: `lib/actions/stock.actions.ts`

- [ ] **Step 1: Create the file**

```ts
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import {
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
  getStockBalance,
  getPendingRegradeRequests,
} from '@/lib/services/stock.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const adjustmentSchema = z.object({
  flockId: z.string().uuid(),
  adjustmentDate: z.coerce.date(),
  grade: z.enum(['A', 'B']),
  quantity: z.coerce.number().int().refine((n) => n !== 0, 'Kuantitas tidak boleh 0'),
  reason: z.string().min(1, 'Alasan wajib diisi'),
  notes: z.string().optional(),
})

const regradeSchema = z.object({
  flockId: z.string().uuid(),
  gradeFrom: z.enum(['A', 'B']),
  gradeTo: z.enum(['A', 'B']),
  quantity: z.coerce.number().int().positive('Kuantitas harus positif'),
  requestDate: z.coerce.date(),
  notes: z.string().optional(),
})

export async function createStockAdjustmentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session || session.role === 'operator') return { success: false, error: 'Akses ditolak' }

  const parsed = adjustmentSchema.safeParse({
    flockId: formData.get('flockId'),
    adjustmentDate: formData.get('adjustmentDate'),
    grade: formData.get('grade'),
    quantity: formData.get('quantity'),
    reason: formData.get('reason'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const adj = await createStockAdjustment(parsed.data, session.id)
    return { success: true, data: { id: adj.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan penyesuaian' }
  }
}

export async function submitRegradeRequestAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = regradeSchema.safeParse({
    flockId: formData.get('flockId'),
    gradeFrom: formData.get('gradeFrom'),
    gradeTo: formData.get('gradeTo'),
    quantity: formData.get('quantity'),
    requestDate: formData.get('requestDate'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const req = await submitRegradeRequest(parsed.data, session.id)
    return { success: true, data: { id: req.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat permintaan regrade' }
  }
}

export async function approveRegradeRequestAction(requestId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await approveRegradeRequest(requestId, session.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyetujui regrade' }
  }
}

export async function rejectRegradeRequestAction(requestId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await rejectRegradeRequest(requestId, session.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menolak regrade' }
  }
}

export async function getStockSummaryAction(
  flockId: string
): Promise<ActionResult<{ gradeA: number; gradeB: number }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const [gradeA, gradeB] = await Promise.all([
      getStockBalance(flockId, 'A'),
      getStockBalance(flockId, 'B'),
    ])
    return { success: true, data: { gradeA, gradeB } }
  } catch {
    return { success: false, error: 'Gagal memuat data stok' }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/actions/stock.actions.ts
git commit -m "feat(action): stock server actions — adjustment, regrade submit/approve/reject"
```

---

## Task 12: stok pages

**Files:**
- Modify: `app/(app)/stok/page.tsx`
- Create: `app/(app)/stok/sesuaikan/page.tsx`
- Create: `app/(app)/stok/regrade/page.tsx`
- Create: `app/(app)/stok/regrade/[id]/page.tsx`

- [ ] **Step 1: Replace `app/(app)/stok/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'
import Link from 'next/link'

export default async function StokPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const flocks = await findAllActiveFlocks()
  const stockData = await Promise.all(
    flocks.map(async (f) => ({
      ...f,
      gradeA: await getStockBalance(f.id, 'A'),
      gradeB: await getStockBalance(f.id, 'B'),
    }))
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Stok Telur</h1>
        {session.role !== 'operator' && (
          <div className="flex gap-2">
            <Link href="/stok/sesuaikan" className="text-sm px-3 py-2 bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white rounded-lg shadow-lf-btn">
              Penyesuaian
            </Link>
            <Link href="/stok/regrade" className="text-sm px-3 py-2 border border-[var(--lf-border)] rounded-lg text-[var(--lf-text-mid)]">
              Regrade
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {stockData.length === 0 && (
          <p className="text-[var(--lf-text-soft)] text-center py-16">Tidak ada flock aktif.</p>
        )}
        {stockData.map((f) => (
          <div key={f.id} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--lf-text-dark)]">{f.name}</p>
              <p className="text-xs text-[var(--lf-text-soft)] mt-0.5">{f.coopName}</p>
            </div>
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide">Grade A</p>
                <p className="font-semibold text-[var(--lf-text-dark)]">{f.gradeA.toLocaleString('id')}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide">Grade B</p>
                <p className="font-semibold text-[var(--lf-text-dark)]">{f.gradeB.toLocaleString('id')}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide">Total</p>
                <p className="font-semibold text-[var(--lf-blue-active)]">{(f.gradeA + f.gradeB).toLocaleString('id')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(app)/stok/sesuaikan/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { createStockAdjustmentAction } from '@/lib/actions/stock.actions'

export default async function SesuaikanPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session || session.role === 'operator') redirect('/stok')

  const flocks = await findAllActiveFlocks()
  const { error } = await searchParams

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await createStockAdjustmentAction(formData)
    if (result.success) redirect('/stok')
    else redirect(`/stok/sesuaikan?error=${encodeURIComponent(result.error)}`)
  }

  const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[#fafaf9] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Penyesuaian Stok</h1>
      {error && (
        <div className="mb-4 bg-[#fdeeed] text-[#e07a6a] rounded-lg px-4 py-3 text-sm">{error}</div>
      )}
      <form action={handleSubmit} className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select name="flockId" className={inputClass} required>
            {flocks.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Tanggal</label>
          <input type="date" name="adjustmentDate" defaultValue={new Date().toISOString().split('T')[0]} className={inputClass} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Grade</label>
            <select name="grade" className={inputClass} required>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Kuantitas (+/-)</label>
            <input type="number" name="quantity" placeholder="-50 atau 100" className={inputClass} required />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Alasan</label>
          <input type="text" name="reason" className={inputClass} required />
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
          <input type="text" name="notes" className={inputClass} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn">
          Simpan Penyesuaian
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(app)/stok/regrade/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect } from 'next/navigation'
import { findAllActiveFlocks } from '@/lib/db/queries/flock.queries'
import { findPendingRegradeRequests } from '@/lib/db/queries/inventory.queries'
import { submitRegradeRequestAction } from '@/lib/actions/stock.actions'
import Link from 'next/link'

export default async function RegradePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/stok')

  const [flocks, pending] = await Promise.all([
    findAllActiveFlocks(),
    findPendingRegradeRequests(),
  ])
  const { error } = await searchParams

  async function handleSubmit(formData: FormData) {
    'use server'
    const result = await submitRegradeRequestAction(formData)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade?error=${encodeURIComponent(result.error)}`)
  }

  const inputClass = 'mt-1 w-full border border-[var(--lf-border)] rounded-lg px-3 py-2 text-sm bg-[#fafaf9] focus:outline-none focus:ring-2 focus:ring-[var(--lf-blue)]'

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Regrade Telur</h1>

      {error && <div className="bg-[#fdeeed] text-[#e07a6a] rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* Submit form */}
      <form action={handleSubmit} className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-4">
        <p className="text-sm font-medium text-[var(--lf-text-dark)]">Permintaan Regrade Baru</p>
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Flock</label>
          <select name="flockId" className={inputClass} required>
            {flocks.map((f) => <option key={f.id} value={f.id}>{f.name} — {f.coopName}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Dari Grade</label>
            <select name="gradeFrom" className={inputClass} required>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Ke Grade</label>
            <select name="gradeTo" className={inputClass} required>
              <option value="B">Grade B</option>
              <option value="A">Grade A</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Jumlah</label>
            <input type="number" name="quantity" min="1" className={inputClass} required />
          </div>
        </div>
        <input type="hidden" name="requestDate" value={new Date().toISOString().split('T')[0]} />
        <div>
          <label className="text-xs font-medium text-[var(--lf-text-mid)] uppercase tracking-wide">Catatan</label>
          <input type="text" name="notes" className={inputClass} />
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn">
          Kirim Permintaan
        </button>
      </form>

      {/* Pending list */}
      <div>
        <p className="text-sm font-medium text-[var(--lf-text-dark)] mb-3">Menunggu Persetujuan ({pending.length})</p>
        {pending.length === 0 ? (
          <p className="text-[var(--lf-text-soft)] text-sm">Tidak ada permintaan pending.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-lf-sm border border-[var(--lf-border)] flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-[var(--lf-text-dark)]">Grade {r.gradeFrom} → {r.gradeTo}</span>
                  <span className="ml-2 text-[var(--lf-text-mid)]">{r.quantity.toLocaleString('id')} butir</span>
                </div>
                {session.role === 'admin' && (
                  <Link href={`/stok/regrade/${r.id}`} className="text-xs text-[var(--lf-blue-active)] hover:underline">
                    Tinjau →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(app)/stok/regrade/[id]/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { redirect, notFound } from 'next/navigation'
import { findRegradeRequestById } from '@/lib/db/queries/inventory.queries'
import { approveRegradeRequestAction, rejectRegradeRequestAction } from '@/lib/actions/stock.actions'

export default async function RegradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/stok/regrade')

  const { id } = await params
  const req = await findRegradeRequestById(id)
  if (!req) notFound()

  async function approve() {
    'use server'
    const result = await approveRegradeRequestAction(id)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade/${id}?error=${encodeURIComponent(result.error)}`)
  }

  async function reject() {
    'use server'
    const result = await rejectRegradeRequestAction(id)
    if (result.success) redirect('/stok/regrade')
    else redirect(`/stok/regrade/${id}?error=${encodeURIComponent(result.error)}`)
  }

  const statusColor = req.status === 'PENDING' ? 'text-[#d4a96a]' : req.status === 'APPROVED' ? 'text-[#7ab8b0]' : 'text-[#e07a6a]'

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold text-[var(--lf-text-dark)] mb-6">Detail Regrade</h1>
      <div className="bg-white rounded-xl p-5 shadow-lf-sm border border-[var(--lf-border)] space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Status</span>
          <span className={`font-medium ${statusColor}`}>{req.status}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Dari → Ke</span>
          <span className="font-medium text-[var(--lf-text-dark)]">Grade {req.gradeFrom} → Grade {req.gradeTo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--lf-text-mid)]">Jumlah</span>
          <span className="font-medium text-[var(--lf-text-dark)]">{req.quantity.toLocaleString('id')} butir</span>
        </div>
        {req.notes && (
          <div className="flex justify-between">
            <span className="text-[var(--lf-text-mid)]">Catatan</span>
            <span className="text-[var(--lf-text-dark)]">{req.notes}</span>
          </div>
        )}
      </div>

      {req.status === 'PENDING' && (
        <div className="mt-6 flex gap-3">
          <form action={approve} className="flex-1">
            <button type="submit" className="w-full bg-gradient-to-r from-[#7aadd4] to-[#5090be] text-white font-medium rounded-xl py-3 shadow-lf-btn">
              Setujui
            </button>
          </form>
          <form action={reject} className="flex-1">
            <button type="submit" className="w-full border border-[#e07a6a] text-[#e07a6a] font-medium rounded-xl py-3">
              Tolak
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Start dev, test all stok pages**

```bash
npm run dev
```

Check:
- `/stok` shows stock balance cards per flock (zeros if no data yet)
- `/stok/sesuaikan` shows form; submit redirects to `/stok` on success
- `/stok/regrade` shows form + pending list
- `/stok/regrade/[id]` shows detail with approve/reject for admin

- [ ] **Step 6: Commit**

```bash
git add app/\(app\)/stok/page.tsx app/\(app\)/stok/sesuaikan/page.tsx app/\(app\)/stok/regrade/page.tsx "app/(app)/stok/regrade/[id]/page.tsx"
git commit -m "feat(page): stok pages — balance display, adjustment form, regrade submit/approve/reject"
```

---

## Task 13: Install Recharts + dashboard.mock.ts

**Files:**
- Create: `lib/mock/dashboard.mock.ts`

- [ ] **Step 1: Install Recharts**

```bash
npm install recharts
```

Expected: `recharts` added to `dependencies` in `package.json`.

- [ ] **Step 2: Create `lib/mock/dashboard.mock.ts`**

```ts
export type DailyChartPoint = {
  date: string
  hdp: number
  fcr: number
  gradeA: number
  gradeB: number
  cumulativeDepletion: number
}

export type RecentRecord = {
  date: string
  gradeA: number
  gradeB: number
  deaths: number
  feedKg: number
  fcr: number
  isLate: boolean
}

export const MOCK_KPI = {
  hdpPercent: 87.5,
  fcr7Day: 1.80,
  productionToday: 2340,
  stockReadyToSell: 18750,
  activePopulation: 2680,
  feedPerBirdGrams: 115,
}

export const MOCK_CHART_DATA: DailyChartPoint[] = [
  { date: '15/04', hdp: 85.2, fcr: 1.85, gradeA: 2100, gradeB: 180, cumulativeDepletion: 120 },
  { date: '16/04', hdp: 86.1, fcr: 1.82, gradeA: 2150, gradeB: 170, cumulativeDepletion: 128 },
  { date: '17/04', hdp: 84.8, fcr: 1.90, gradeA: 2050, gradeB: 160, cumulativeDepletion: 135 },
  { date: '18/04', hdp: 87.3, fcr: 1.79, gradeA: 2200, gradeB: 190, cumulativeDepletion: 142 },
  { date: '19/04', hdp: 88.1, fcr: 1.75, gradeA: 2260, gradeB: 200, cumulativeDepletion: 148 },
  { date: '20/04', hdp: 87.9, fcr: 1.77, gradeA: 2250, gradeB: 185, cumulativeDepletion: 155 },
  { date: '21/04', hdp: 87.5, fcr: 1.80, gradeA: 2220, gradeB: 120, cumulativeDepletion: 160 },
]

export const MOCK_RECENT_RECORDS: RecentRecord[] = [
  { date: '21/04', gradeA: 2220, gradeB: 120, deaths: 3, feedKg: 310, fcr: 1.80, isLate: false },
  { date: '20/04', gradeA: 2250, gradeB: 185, deaths: 7, feedKg: 310, fcr: 1.77, isLate: false },
  { date: '19/04', gradeA: 2260, gradeB: 200, deaths: 6, feedKg: 308, fcr: 1.75, isLate: true },
  { date: '18/04', gradeA: 2200, gradeB: 190, deaths: 7, feedKg: 310, fcr: 1.79, isLate: false },
  { date: '17/04', gradeA: 2050, gradeB: 160, deaths: 9, feedKg: 308, fcr: 1.90, isLate: false },
  { date: '16/04', gradeA: 2150, gradeB: 170, deaths: 8, feedKg: 308, fcr: 1.82, isLate: false },
  { date: '15/04', gradeA: 2100, gradeB: 180, deaths: 8, feedKg: 305, fcr: 1.85, isLate: false },
]
```

- [ ] **Step 3: Commit**

```bash
git add lib/mock/dashboard.mock.ts package.json package-lock.json
git commit -m "feat(mock): dashboard mock data + install recharts"
```

---

## Task 14: kpi-card.tsx

**Files:**
- Create: `components/ui/kpi-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { cn } from '@/lib/utils'

type KpiCardProps = {
  label: string
  value: string | number
  unit?: string
  className?: string
}

export function KpiCard({ label, value, unit, className }: KpiCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]', className)}>
      <p className="text-[10px] font-medium text-[var(--lf-text-soft)] uppercase tracking-[0.8px]">{label}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--lf-text-dark)]">{value}</span>
        {unit && <span className="text-xs text-[var(--lf-text-mid)]">{unit}</span>}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/kpi-card.tsx
git commit -m "feat(ui): KpiCard component"
```

---

## Task 15: Chart components

**Files:**
- Create: `components/ui/charts/hdp-line-chart.tsx`
- Create: `components/ui/charts/fcr-line-chart.tsx`
- Create: `components/ui/charts/production-bar-chart.tsx`
- Create: `components/ui/charts/depletion-area-chart.tsx`

- [ ] **Step 1: Create `components/ui/charts/hdp-line-chart.tsx`**

```tsx
'use client'
// client: Recharts requires DOM APIs

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; hdp: number }

export function HdpLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#8fa08f' }} unit="%" />
        <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'HDP']} />
        <Line type="monotone" dataKey="hdp" stroke="#7aadd4" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 2: Create `components/ui/charts/fcr-line-chart.tsx`**

```tsx
'use client'
// client: Recharts requires DOM APIs

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; fcr: number }

export function FcrLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis domain={[1, 3]} tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip formatter={(v: number) => [v.toFixed(2), 'FCR']} />
        <ReferenceLine y={2.1} stroke="#e07a6a" strokeDasharray="4 2" label={{ value: '2.1', fill: '#e07a6a', fontSize: 10 }} />
        <Line type="monotone" dataKey="fcr" stroke="#7ab8b0" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Create `components/ui/charts/production-bar-chart.tsx`**

```tsx
'use client'
// client: Recharts requires DOM APIs

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; gradeA: number; gradeB: number }

export function ProductionBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="gradeA" name="Grade A" fill="#7aadd4" radius={[3, 3, 0, 0]} />
        <Bar dataKey="gradeB" name="Grade B" fill="#d4a96a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 4: Create `components/ui/charts/depletion-area-chart.tsx`**

```tsx
'use client'
// client: Recharts requires DOM APIs

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DataPoint = { date: string; cumulativeDepletion: number }

export function DepletionAreaChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e8df" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <YAxis tick={{ fontSize: 11, fill: '#8fa08f' }} />
        <Tooltip formatter={(v: number) => [v, 'Kumulatif Depletion']} />
        <Area type="monotone" dataKey="cumulativeDepletion" stroke="#e8a5a0" fill="#fdeeed" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/ui/charts/
git commit -m "feat(ui): Recharts chart components — HDP%, FCR (2.1 threshold), Grade A/B bar, depletion area"
```

---

## Task 16: Rebuild dashboard/page.tsx

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Replace `app/(app)/dashboard/page.tsx`**

```tsx
import { getSession } from '@/lib/auth/get-session'
import { KpiCard } from '@/components/ui/kpi-card'
import { MOCK_KPI, MOCK_CHART_DATA, MOCK_RECENT_RECORDS } from '@/lib/mock/dashboard.mock'
import dynamic from 'next/dynamic'

const HdpLineChart = dynamic(
  () => import('@/components/ui/charts/hdp-line-chart').then((m) => m.HdpLineChart),
  { ssr: false }
)
const FcrLineChart = dynamic(
  () => import('@/components/ui/charts/fcr-line-chart').then((m) => m.FcrLineChart),
  { ssr: false }
)
const ProductionBarChart = dynamic(
  () => import('@/components/ui/charts/production-bar-chart').then((m) => m.ProductionBarChart),
  { ssr: false }
)
const DepletionAreaChart = dynamic(
  () => import('@/components/ui/charts/depletion-area-chart').then((m) => m.DepletionAreaChart),
  { ssr: false }
)

export default async function DashboardPage() {
  const user = await getSession()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--lf-text-dark)]">Dashboard</h1>
        <p className="text-sm text-[var(--lf-text-soft)] mt-0.5">Selamat datang, {user?.fullName}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="HDP%" value={`${MOCK_KPI.hdpPercent.toFixed(1)}%`} />
        <KpiCard label="FCR 7 Hari" value={MOCK_KPI.fcr7Day.toFixed(2)} />
        <KpiCard label="Produksi Hari Ini" value={MOCK_KPI.productionToday.toLocaleString('id')} unit="butir" />
        <KpiCard label="Stok Siap Jual" value={MOCK_KPI.stockReadyToSell.toLocaleString('id')} unit="butir" />
        <KpiCard label="Populasi Aktif" value={MOCK_KPI.activePopulation.toLocaleString('id')} unit="ekor" />
        <KpiCard label="Pakan/Ekor" value={MOCK_KPI.feedPerBirdGrams} unit="g" />
      </div>

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
          <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">HDP% (7 Hari)</p>
          <HdpLineChart data={MOCK_CHART_DATA} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
          <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">FCR (7 Hari)</p>
          <FcrLineChart data={MOCK_CHART_DATA} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
          <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Produksi Grade A / B</p>
          <ProductionBarChart data={MOCK_CHART_DATA} />
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
          <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">Kumulatif Depletion</p>
          <DepletionAreaChart data={MOCK_CHART_DATA} />
        </div>
      </div>

      {/* Recent records table */}
      <div className="bg-white rounded-2xl p-4 shadow-lf-sm border border-[var(--lf-border)]">
        <p className="text-xs font-medium text-[var(--lf-text-soft)] uppercase tracking-wide mb-3">7 Catatan Terakhir</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-[var(--lf-text-soft)] uppercase tracking-wide border-b border-[var(--lf-border)]">
                <th className="text-left pb-2">Tanggal</th>
                <th className="text-right pb-2">Grade A</th>
                <th className="text-right pb-2">Grade B</th>
                <th className="text-right pb-2">Kematian</th>
                <th className="text-right pb-2">FCR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--lf-border)]">
              {MOCK_RECENT_RECORDS.map((r) => (
                <tr key={r.date} className="py-2">
                  <td className="py-2 text-[var(--lf-text-dark)]">
                    {r.date}
                    {r.isLate && (
                      <span className="ml-2 text-[10px] bg-[#fdeeed] text-[#e07a6a] rounded px-1.5 py-0.5">Terlambat</span>
                    )}
                  </td>
                  <td className="py-2 text-right text-[var(--lf-text-dark)]">{r.gradeA.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-dark)]">{r.gradeB.toLocaleString('id')}</td>
                  <td className="py-2 text-right text-[var(--lf-text-mid)]">{r.deaths}</td>
                  <td className={`py-2 text-right font-medium ${r.fcr > 2.1 ? 'text-[#e07a6a]' : 'text-[var(--lf-text-dark)]'}`}>
                    {r.fcr.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server, navigate to `/dashboard`, verify**

```bash
npm run dev
```

Check:
- 6 KPI cards render in 2×3 grid
- 4 charts render (Recharts loads client-side, no SSR errors)
- FCR reference line at 2.1 visible
- Table shows 7 rows; FCR > 2.1 highlighted red; late-input badge visible on row 3

- [ ] **Step 3: Run build to verify no type or SSR errors**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx
git commit -m "feat(page): dashboard — 6 KPI cards + 4 Recharts charts + data table (mock data, Sprint 4)"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Sprint 2: daily_records + inventory_movements schemas, backdate rules, duplicate guard, late-input flag, sessionStorage, last-7-records table
- ✅ Sprint 3: stock_adjustments + regrade_requests schemas, balance guard, regrade approval 2x-movement tx, pending-block note (blocks from sale — enforced when sales module is added)
- ✅ Sprint 4: 6 KPI cards, 4 Recharts charts (HDP%, FCR, Grade A/B bar, depletion area), 7-day period, FCR>2.1 red, late-input badge, mock data

**Known deferred items (YAGNI for Phase 2):**
- In-app notification on regrade submit → add in Phase 3 when notification table is defined
- Coop filter on dashboard (Operator scoped) → wire when real queries replace mock
- 7d/14d/30d period filter on dashboard → wire when real queries replace mock

**No placeholders found.** All steps have exact code.
