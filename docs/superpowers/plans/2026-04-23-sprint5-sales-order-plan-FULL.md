# Sprint 5 — Sales Order & Sales Return: Implementation Plan

**Date:** 2026-04-23
**Spec:** `docs/specs/2026-04-22-sprint5-sales-order-design.md`
**Approach:** TDD — write test first, then implementation. Bite-sized tasks (2–5 min each).

---

## Phase 1: Schema & Migration

### Task 1.1 — Create `lib/db/schema/sales-orders.ts`

Create file:

```ts
import { pgTable, uuid, text, integer, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { users } from './users'

export const salesOrderStatusEnum = pgEnum('sales_order_status', ['draft', 'confirmed', 'fulfilled', 'cancelled'])
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'credit'])

export const salesOrders = pgTable('sales_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  orderDate: date('order_date', { mode: 'date' }).notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: salesOrderStatusEnum('status').notNull().default('draft'),
  taxPct: numeric('tax_pct', { precision: 5, scale: 2 }).default('0').notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type SalesOrder = typeof salesOrders.$inferSelect
export type NewSalesOrder = typeof salesOrders.$inferInsert
```

### Task 1.2 — Create `lib/db/schema/sales-order-items.ts`

```ts
import { pgTable, uuid, text, integer, numeric } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { flocks } from './flocks'

export const salesItemTypeEnum = pgEnum('sales_item_type', ['egg_grade_a', 'egg_grade_b', 'flock', 'other'])
export const salesUnitEnum = pgEnum('sales_unit', ['butir', 'ekor', 'unit'])

export const salesOrderItems = pgTable('sales_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => salesOrders.id),
  itemType: salesItemTypeEnum('item_type').notNull(),
  itemRefId: uuid('item_ref_id'),
  description: text('description'),
  quantity: integer('quantity').notNull(),
  unit: salesUnitEnum('unit').notNull(),
  pricePerUnit: numeric('price_per_unit', { precision: 15, scale: 2 }).notNull(),
  discountPct: numeric('discount_pct', { precision: 5, scale: 2 }).default('0').notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
})

export type SalesOrderItem = typeof salesOrderItems.$inferSelect
export type NewSalesOrderItem = typeof salesOrderItems.$inferInsert
```

### Task 1.3 — Create `lib/db/schema/sales-returns.ts`

```ts
import { pgTable, uuid, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { customers } from './customers'
import { users } from './users'

export const salesReturnStatusEnum = pgEnum('sales_return_status', ['pending', 'approved', 'rejected'])
export const returnReasonTypeEnum = pgEnum('return_reason_type', ['wrong_grade', 'damaged', 'quantity_error', 'other'])

export const salesReturns = pgTable('sales_returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  returnNumber: text('return_number').notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => salesOrders.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  returnDate: date('return_date', { mode: 'date' }).notNull(),
  reasonType: returnReasonTypeEnum('reason_type').notNull(),
  notes: text('notes'),
  status: salesReturnStatusEnum('status').notNull().default('pending'),
  submittedBy: uuid('submitted_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type SalesReturn = typeof salesReturns.$inferSelect
export type NewSalesReturn = typeof salesReturns.$inferInsert
```

### Task 1.4 — Create `lib/db/schema/sales-return-items.ts`

```ts
import { pgTable, uuid, integer } from 'drizzle-orm/pg-core'
import { salesReturns } from './sales-returns'
import { salesItemTypeEnum, salesUnitEnum } from './sales-order-items'

export const salesReturnItems = pgTable('sales_return_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  returnId: uuid('return_id').notNull().references(() => salesReturns.id),
  itemType: salesItemTypeEnum('item_type').notNull(),
  itemRefId: uuid('item_ref_id'),
  quantity: integer('quantity').notNull(),
  unit: salesUnitEnum('unit').notNull(),
})

export type SalesReturnItem = typeof salesReturnItems.$inferSelect
export type NewSalesReturnItem = typeof salesReturnItems.$inferInsert
```

### Task 1.5 — Create `lib/db/schema/invoices.ts`

```ts
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { salesReturns } from './sales-returns'
import { customers } from './customers'
import { users } from './users'

export const invoiceTypeEnum = pgEnum('invoice_type', ['sales_invoice', 'cash_receipt', 'credit_note'])
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'])

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  type: invoiceTypeEnum('type').notNull(),
  orderId: uuid('order_id').references(() => salesOrders.id),
  referenceInvoiceId: uuid('reference_invoice_id'),
  returnId: uuid('return_id').references(() => salesReturns.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  issueDate: date('issue_date', { mode: 'date' }).notNull(),
  dueDate: date('due_date', { mode: 'date' }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  status: invoiceStatusEnum('status').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert
```

### Task 1.6 — Create `lib/db/schema/payments.ts`

```ts
import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { invoices } from './invoices'
import { users } from './users'

export const paymentMethodTypeEnum = pgEnum('payment_method_type', ['cash', 'transfer', 'cheque', 'credit'])

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  paymentDate: date('payment_date', { mode: 'date' }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  method: paymentMethodTypeEnum('method').notNull(),
  referenceNumber: text('reference_number'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
```

### Task 1.7 — Create `lib/db/schema/customer-credits.ts`

```ts
import { pgTable, uuid, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { payments } from './payments'
import { invoices } from './invoices'

export const creditSourceTypeEnum = pgEnum('credit_source_type', ['overpayment', 'credit_note'])

export const customerCredits = pgTable('customer_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  sourceType: creditSourceTypeEnum('source_type').notNull(),
  sourcePaymentId: uuid('source_payment_id').references(() => payments.id),
  sourceInvoiceId: uuid('source_invoice_id').references(() => invoices.id),
  usedAmount: numeric('used_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type CustomerCredit = typeof customerCredits.$inferSelect
export type NewCustomerCredit = typeof customerCredits.$inferInsert
```

### Task 1.8 — Create `lib/db/schema/correction-records.ts`

```ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const correctionEntityTypeEnum = pgEnum('correction_entity_type', ['daily_records', 'inventory_movements', 'sales_orders'])

export const correctionRecords = pgTable('correction_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: correctionEntityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  fieldName: text('field_name').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  reason: text('reason').notNull(),
  correctedBy: uuid('corrected_by').notNull().references(() => users.id),
  correctedAt: timestamp('corrected_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type CorrectionRecord = typeof correctionRecords.$inferSelect
export type NewCorrectionRecord = typeof correctionRecords.$inferInsert
```

### Task 1.9 — Create `lib/db/schema/notifications.ts`

```ts
import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const notificationTypeEnum = pgEnum('notification_type', ['production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other'])
export const notificationTargetRoleEnum = pgEnum('notification_target_role', ['operator', 'supervisor', 'admin', 'all'])

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  targetRole: notificationTargetRoleEnum('target_role').notNull(),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: uuid('related_entity_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
```

### Task 1.10 — Create `lib/db/schema/notification-reads.ts`

```ts
import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { notifications } from './notifications'
import { users } from './users'

export const notificationReads = pgTable('notification_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').notNull().references(() => notifications.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('notification_reads_unique').on(t.notificationId, t.userId),
])

export type NotificationRead = typeof notificationReads.$inferSelect
export type NewNotificationRead = typeof notificationReads.$inferInsert
```

### Task 1.11 — Create `lib/db/schema/alert-cooldowns.ts`

```ts
import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const alertCooldowns = pgTable('alert_cooldowns', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertType: text('alert_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  lastSentAt: timestamp('last_sent_at', { withTimezone: true }).notNull(),
}, (t) => [
  uniqueIndex('alert_cooldowns_unique').on(t.alertType, t.entityId),
])

export type AlertCooldown = typeof alertCooldowns.$inferSelect
export type NewAlertCooldown = typeof alertCooldowns.$inferInsert
```

### Task 1.12 — Update `lib/db/schema/customers.ts` — add `blocked` to status enum

Edit `customerStatusEnum`:

```ts
// BEFORE:
export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive'])
// AFTER:
export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive', 'blocked'])
```

### Task 1.13 — Refactor `lib/db/schema/inventory-movements.ts`

Breaking changes per spec:
- `flockId`: required → nullable
- Add `sourceType` enum replacing `referenceType`
- Add `sourceId` uuid replacing `referenceId`
- Add `source` enum
- Rename `movementType` values IN/OUT → in/out

```ts
import { pgTable, uuid, integer, date, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const movementTypeEnum = pgEnum('movement_type', ['in', 'out'])
export const movementSourceEnum = pgEnum('movement_source', ['production', 'sale', 'adjustment', 'regrade', 'import'])
export const movementSourceTypeEnum = pgEnum('movement_source_type', ['daily_records', 'sales_order_items', 'stock_adjustments', 'regrade_requests', 'sales_returns', 'import'])

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').references(() => flocks.id),
  movementType: movementTypeEnum('movement_type').notNull(),
  source: movementSourceEnum('source').notNull(),
  sourceType: movementSourceTypeEnum('source_type'),
  sourceId: uuid('source_id'),
  grade: text('grade', { enum: ['A', 'B'] }).notNull(),
  quantity: integer('quantity').notNull(),
  note: text('note'),
  movementDate: date('movement_date', { mode: 'date' }).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert
```

### Task 1.14 — Update `lib/db/schema/index.ts` — add all new exports

Append to existing file:

```ts
export * from './sales-orders'
export * from './sales-order-items'
export * from './sales-returns'
export * from './sales-return-items'
export * from './invoices'
export * from './payments'
export * from './customer-credits'
export * from './correction-records'
export * from './notifications'
export * from './notification-reads'
export * from './alert-cooldowns'
```

### Task 1.15 — Generate migration 5a

```bash
npm run db:generate
```

Review generated SQL. Must contain:
- ALTER `inventory_movements`: add columns, alter flock_id nullable
- CREATE TABLE `sales_orders`, `sales_order_items`, `sales_returns`, `sales_return_items`
- ALTER `customers` enum: add `blocked`
- Data migration script for existing `referenceType`/`referenceId` → `source_type`/`source_id`

**STOP — review generated SQL before proceeding.** Check for unintended DROP TABLE / DROP COLUMN.

### Task 1.16 — Fix migration 5a SQL if needed

If drizzle-kit generates destructive changes, edit the SQL file manually. Key things to verify:
- `flock_id` ALTER: `ALTER TABLE inventory_movements ALTER COLUMN flock_id DROP NOT NULL`
- Data migration for existing rows: UPDATE `reference_type` → `source_type`, `reference_id` → `source_id`
- Old columns `reference_type` and `reference_id` should be dropped after data migration

### Task 1.17 — Run migration 5a

```bash
npm run db:migrate
```

### Task 1.18 — Generate migration 5b (finance schema)

After 5a succeeds, the finance schema tables (invoices, payments, customer_credits, correction_records, notifications, notification_reads, alert_cooldowns) should be auto-detected by drizzle-kit.

```bash
npm run db:generate
```

Review SQL. Should only contain CREATE TABLE for the 7 finance tables. No destructive changes expected.

### Task 1.19 — Run migration 5b

```bash
npm run db:migrate
```

---

## Phase 2: Utility Layer

### Task 2.1 — Create `lib/utils/order-number.ts`

```ts
// USED BY: [sales-order.service, sales-return.service, invoice creation] — count: 3+
export function generateOrderNumber(
  prefix: 'SO' | 'RTN' | 'INV' | 'RCP' | 'CN',
  lastSeq: number
): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const seq = String(lastSeq + 1).padStart(4, '0')
  return `${prefix}-${year}${month}-${seq}`
}
```

### Task 2.2 — Unit test `lib/utils/order-number.test.ts`

```ts
import { describe, it, expect, vi } from 'vitest'
import { generateOrderNumber } from './order-number'

describe('generateOrderNumber', () => {
  it('formats with prefix, YYYYMM, and 4-digit padding', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-04-15'))
    expect(generateOrderNumber('SO', 0)).toBe('SO-202604-0001')
    expect(generateOrderNumber('RTN', 9)).toBe('RTN-202604-0010')
    expect(generateOrderNumber('CN', 999)).toBe('CN-202604-1000')
    vi.useRealTimers()
  })
})
```

Run: `npx vitest run lib/utils/order-number.test.ts`

---

## Phase 3: Query Layer

### Task 3.1 — Create `lib/db/queries/sales-order.queries.ts`

```ts
import { db } from '@/lib/db'
import { salesOrders, salesOrderItems, inventoryMovements, invoices, flocks } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import type { SalesOrder, SalesOrderItem, NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'

export async function findSalesOrderById(id: string): Promise<SalesOrder | null> {
  const [row] = await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1)
  return row ?? null
}

export async function findSalesOrderItems(orderId: string): Promise<SalesOrderItem[]> {
  return db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, orderId))
}

export async function countSalesOrdersThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth.replace('-', '')}-%`
  const [row] = await db
    .select({ cnt: count() })
    .from(salesOrders)
    .where(sql`${salesOrders.orderNumber} LIKE ${pattern}`)
  return row?.cnt ?? 0
}

export async function insertSalesOrderWithItems(
  order: NewSalesOrder,
  items: NewSalesOrderItem[]
): Promise<SalesOrder> {
  return db.transaction(async (tx) => {
    const [so] = await tx.insert(salesOrders).values(order).returning()
    if (items.length > 0) {
      await tx.insert(salesOrderItems).values(items.map(i => ({ ...i, orderId: so!.id })))
    }
    return so!
  })
}

export async function updateSalesOrderStatus(
  id: string,
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled',
  updatedBy: string
): Promise<void> {
  await db
    .update(salesOrders)
    .set({ status, updatedBy })
    .where(eq(salesOrders.id, id))
}

export async function deleteDraftSO(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(salesOrderItems).where(eq(salesOrderItems.orderId, id))
    await tx.delete(salesOrders).where(eq(salesOrders.id, id))
  })
}

export async function getAvailableStockForUpdate(grade: 'A' | 'B'): Promise<number> {
  const [row] = await db
    .select({
      balance: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END), 0)`,
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.grade, grade))
    .for('update')
  return Number(row?.balance ?? 0)
}

export async function fulfillSOTx(
  orderId: string,
  userId: string,
  movements: NewInventoryMovement[],
  invoice: NewInvoice,
  flockUpdates: { flockId: string; status: string; retiredAt: Date }[]
): Promise<void> {
  await db.transaction(async (tx) => {
    // Lock the SO row
    const [so] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, orderId))
      .limit(1)
      .for('update')

    if (!so) throw new Error('SO not found')
    if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')

    // Check stock for each egg item
    for (const mv of movements) {
      if (mv.grade) {
        const [stockRow] = await tx
          .select({
            balance: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END), 0)`,
          })
          .from(inventoryMovements)
          .where(eq(inventoryMovements.grade, mv.grade))

        const balance = Number(stockRow?.balance ?? 0)
        if (balance < (mv.quantity ?? 0)) {
          throw new Error('Stok tidak mencukupi saat transaksi diproses')
        }
      }
    }

    // Update SO status
    await tx
      .update(salesOrders)
      .set({ status: 'fulfilled', updatedBy: userId })
      .where(eq(salesOrders.id, orderId))

    // Insert inventory movements
    for (const mv of movements) {
      await tx.insert(inventoryMovements).values(mv)
    }

    // Insert invoice
    await tx.insert(invoices).values(invoice)

    // Update flock status for flock items
    for (const fu of flockUpdates) {
      await tx
        .update(flocks)
        .set({ status: fu.status, retiredAt: fu.retiredAt })
        .where(eq(flocks.id, fu.flockId))
    }
  })
}

export async function getCustomerOutstandingCredit(customerId: string): Promise<number> {
  const [row] = await db
    .select({
      outstanding: sql<number>`COALESCE(SUM(${invoices.totalAmount} - ${invoices.paidAmount}), 0)`,
    })
    .from(invoices)
    .where(and(
      eq(invoices.customerId, customerId),
      sql`${invoices.type} = 'sales_invoice'`,
      sql`${invoices.status} IN ('sent', 'partial', 'overdue')`
    ))
  return Number(row?.outstanding ?? 0)
}

export async function listSalesOrders(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<{ data: SalesOrder[]; total: number }> {
  const conditions = status ? eq(salesOrders.status, status as any) : undefined
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(salesOrders)
    .where(whereClause)

  const data = await db
    .select()
    .from(salesOrders)
    .where(whereClause)
    .orderBy(desc(salesOrders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { data, total: countRow?.cnt ?? 0 }
}
```

### Task 3.2 — Create `lib/db/queries/sales-return.queries.ts`

```ts
import { db } from '@/lib/db'
import { salesReturns, salesReturnItems, inventoryMovements, invoices, customerCredits } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import type { SalesReturn, SalesReturnItem, NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'

export async function findSalesReturnById(id: string): Promise<SalesReturn | null> {
  const [row] = await db.select().from(salesReturns).where(eq(salesReturns.id, id)).limit(1)
  return row ?? null
}

export async function findSalesReturnItems(returnId: string): Promise<SalesReturnItem[]> {
  return db.select().from(salesReturnItems).where(eq(salesReturnItems.returnId, returnId))
}

export async function countSalesReturnsThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth.replace('-', '')}-%`
  const [row] = await db
    .select({ cnt: count() })
    .from(salesReturns)
    .where(sql`${salesReturns.returnNumber} LIKE ${pattern}`)
  return row?.cnt ?? 0
}

export async function insertSalesReturnWithItems(
  ret: NewSalesReturn,
  items: NewSalesReturnItem[]
): Promise<SalesReturn> {
  return db.transaction(async (tx) => {
    const [sr] = await tx.insert(salesReturns).values(ret).returning()
    if (items.length > 0) {
      await tx.insert(salesReturnItems).values(items.map(i => ({ ...i, returnId: sr!.id })))
    }
    return sr!
  })
}

export async function approveSalesReturnTx(
  returnId: string,
  userId: string,
  movements: NewInventoryMovement[],
  creditNoteInvoice: NewInvoice,
  customerCredit: NewCustomerCredit
): Promise<void> {
  await db.transaction(async (tx) => {
    // Lock the return row
    const [sr] = await tx
      .select()
      .from(salesReturns)
      .where(eq(salesReturns.id, returnId))
      .limit(1)
      .for('update')

    if (!sr) throw new Error('Return not found')
    if (sr.status !== 'pending') throw new Error('Return sudah diproses')

    // Insert inventory movements
    for (const mv of movements) {
      await tx.insert(inventoryMovements).values(mv)
    }

    // Insert credit note invoice
    await tx.insert(invoices).values(creditNoteInvoice)

    // Insert customer credit
    await tx.insert(customerCredits).values(customerCredit)

    // Update return status
    await tx
      .update(salesReturns)
      .set({ status: 'approved', reviewedBy: userId, reviewedAt: new Date() })
      .where(eq(salesReturns.id, returnId))
  })
}

export async function rejectSalesReturn(
  returnId: string,
  userId: string
): Promise<void> {
  await db
    .update(salesReturns)
    .set({ status: 'rejected', reviewedBy: userId, reviewedAt: new Date() })
    .where(eq(salesReturns.id, returnId))
}

export async function listSalesReturns(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<{ data: SalesReturn[]; total: number }> {
  const conditions = status ? eq(salesReturns.status, status as any) : undefined
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(salesReturns)
    .where(whereClause)

  const data = await db
    .select()
    .from(salesReturns)
    .where(whereClause)
    .orderBy(desc(salesReturns.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { data, total: countRow?.cnt ?? 0 }
}

export async function findInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  const [row] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1)
  return row ?? null
}
```

### Task 3.3 — Update `lib/db/queries/inventory.queries.ts` — adapt to new schema

The inventory_movements schema changed. Update `getStockBalance`, `getAllStockBalances`, `insertStockAdjustmentWithMovement`, and `approveRegradeRequestTx` to use new column names:

- `movementType: 'IN'` → `movementType: 'in'`
- `movementType: 'OUT'` → `movementType: 'out'`
- `referenceType` → `sourceType` with enum values
- `referenceId` → `sourceId`
- Add `source` field to movement inserts

Also update `getStockBalance` — flockId is now nullable. For global stock queries (grade-only), add a new function:

```ts
export async function getStockBalanceByGrade(grade: 'A' | 'B'): Promise<number> {
  const [row] = await db
    .select({
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.grade, grade))
  return Number(row?.balance ?? '0')
}
```

Keep existing `getStockBalance(flockId, grade)` working — it filters by flockId which is now nullable but still valid for per-flock queries.

---

## Phase 4: Service Layer (TDD)

### Task 4.1 — Write `lib/services/sales-order.service.test.ts` — createDraftSO tests

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/sales-order.queries', () => ({
  findSalesOrderById: vi.fn(),
  countSalesOrdersThisMonth: vi.fn(),
  insertSalesOrderWithItems: vi.fn(),
  updateSalesOrderStatus: vi.fn(),
  deleteDraftSO: vi.fn(),
  fulfillSOTx: vi.fn(),
  getCustomerOutstandingCredit: vi.fn(),
  listSalesOrders: vi.fn(),
}))

vi.mock('@/lib/db/queries/sales-return.queries', () => ({
  findInvoiceByOrderId: vi.fn(),
}))

vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalanceByGrade: vi.fn(),
}))

import * as soQ from '@/lib/db/queries/sales-order.queries'
import * as invQ from '@/lib/db/queries/inventory.queries'
import * as retQ from '@/lib/db/queries/sales-return.queries'
import {
  createDraftSO,
  confirmSO,
  cancelSO,
  deleteDraftSO as deleteDraft,
  fulfillSO,
} from './sales-order.service'

// Helper: mock customer from DB
const mockCustomer = (overrides = {}) => ({
  id: 'cust-1',
  name: 'Toko Baru',
  type: 'retail' as const,
  status: 'active' as const,
  creditLimit: '5000000',
  paymentTerms: 30,
  ...overrides,
})

describe('sales-order.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createDraftSO', () => {
    const validInput = {
      customerId: 'cust-1',
      orderDate: new Date('2026-04-23'),
      paymentMethod: 'cash' as const,
      items: [
        { itemType: 'egg_grade_a' as const, quantity: 100, unit: 'butir' as const, pricePerUnit: '2000', discountPct: '0' },
      ],
      taxPct: '0',
      notes: '',
    }

    it('creates draft SO with valid input', async () => {
      vi.mocked(soQ.countSalesOrdersThisMonth).mockResolvedValue(0)
      vi.mocked(soQ.insertSalesOrderWithItems).mockResolvedValue({
        id: 'so-1', orderNumber: 'SO-202604-0001', status: 'draft',
      } as any) // any: partial mock

      const result = await createDraftSO(validInput, 'user-1', 'supervisor')

      expect(result.orderNumber).toBe('SO-202604-0001')
      expect(soQ.insertSalesOrderWithItems).toHaveBeenCalled()
    })

    it('throws when role is operator', async () => {
      await expect(
        createDraftSO(validInput, 'user-1', 'operator')
      ).rejects.toThrow('Tidak diizinkan')
    })

    it('throws when items array is empty', async () => {
      await expect(
        createDraftSO({ ...validInput, items: [] }, 'user-1', 'supervisor')
      ).rejects.toThrow('Item pesanan tidak boleh kosong')
    })

    it('throws when customer is blocked without override', async () => {
      // Customer blocked - service needs to fetch customer or receive it
      // This will be validated in service by checking customer status
      await expect(
        createDraftSO({ ...validInput, customerId: 'blocked-cust' }, 'user-1', 'supervisor')
      ).rejects.toThrow('Pelanggan diblokir')
    })

    it('creates SO when admin overrides blocked customer', async () => {
      vi.mocked(soQ.countSalesOrdersThisMonth).mockResolvedValue(0)
      vi.mocked(soQ.insertSalesOrderWithItems).mockResolvedValue({
        id: 'so-1', orderNumber: 'SO-202604-0001', status: 'draft',
      } as any) // any: partial mock

      const result = await createDraftSO(
        { ...validInput, customerId: 'blocked-cust', overrideReason: 'Pelanggan sudah bayar tunggakan' },
        'user-1', 'admin'
      )

      expect(result).toBeDefined()
      expect(soQ.insertSalesOrderWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: expect.stringContaining('Pelanggan sudah bayar tunggakan'),
        }),
        expect.any(Array)
      )
    })
  })

  describe('confirmSO', () => {
    it('confirms a draft SO', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'draft',
      } as any) // any: partial mock

      await confirmSO('so-1', 'user-1', 'supervisor')

      expect(soQ.updateSalesOrderStatus).toHaveBeenCalledWith('so-1', 'confirmed', 'user-1')
    })

    it('throws when SO not in draft status', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'fulfilled',
      } as any) // any: partial mock

      await expect(confirmSO('so-1', 'user-1', 'supervisor')).rejects.toThrow('Status SO tidak valid')
    })

    it('throws when role is operator', async () => {
      await expect(confirmSO('so-1', 'user-1', 'operator')).rejects.toThrow('Tidak diizinkan')
    })
  })

  describe('cancelSO', () => {
    it('cancels a confirmed SO', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'confirmed',
      } as any) // any: partial mock

      await cancelSO('so-1', 'user-1', 'supervisor')

      expect(soQ.updateSalesOrderStatus).toHaveBeenCalledWith('so-1', 'cancelled', 'user-1')
    })

    it('throws when SO not in confirmed status', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'draft',
      } as any) // any: partial mock

      await expect(cancelSO('so-1', 'user-1', 'supervisor')).rejects.toThrow('Status SO tidak valid')
    })
  })

  describe('deleteDraftSO', () => {
    it('deletes a draft SO and its items', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'draft',
      } as any) // any: partial mock

      await deleteDraft('so-1', 'user-1', 'supervisor')

      expect(soQ.deleteDraftSO).toHaveBeenCalledWith('so-1')
    })

    it('throws when SO not in draft status', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'confirmed',
      } as any) // any: partial mock

      await expect(deleteDraft('so-1', 'user-1', 'supervisor')).rejects.toThrow('Status SO tidak valid')
    })
  })

  describe('fulfillSO', () => {
    it('calls fulfillSOTx for confirmed SO', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'confirmed', customerId: 'cust-1', paymentMethod: 'cash',
        totalAmount: '200000', orderNumber: 'SO-202604-0001', taxPct: '0', subtotal: '200000', taxAmount: '0',
      } as any) // any: partial mock
      vi.mocked(soQ.findSalesOrderItems).mockResolvedValue([
        { id: 'item-1', itemType: 'egg_grade_a', quantity: 100, unit: 'butir', pricePerUnit: '2000', discountPct: '0', subtotal: '200000' },
      ] as any) // any: partial mock
      vi.mocked(invQ.getStockBalanceByGrade).mockResolvedValue(5000)
      vi.mocked(retQ.findInvoiceByOrderId).mockResolvedValue(null)
      vi.mocked(soQ.fulfillSOTx).mockResolvedValue(undefined)

      await fulfillSO('so-1', 'user-1', 'supervisor')

      expect(soQ.fulfillSOTx).toHaveBeenCalled()
    })

    it('throws when stock insufficient', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'confirmed', customerId: 'cust-1', paymentMethod: 'cash',
        totalAmount: '200000', orderNumber: 'SO-202604-0001', taxPct: '0', subtotal: '200000', taxAmount: '0',
      } as any) // any: partial mock
      vi.mocked(soQ.findSalesOrderItems).mockResolvedValue([
        { id: 'item-1', itemType: 'egg_grade_a', quantity: 100, unit: 'butir', pricePerUnit: '2000', discountPct: '0', subtotal: '200000' },
      ] as any) // any: partial mock
      vi.mocked(invQ.getStockBalanceByGrade).mockResolvedValue(50) // less than 100
      vi.mocked(retQ.findInvoiceByOrderId).mockResolvedValue(null)

      await expect(fulfillSO('so-1', 'user-1', 'supervisor')).rejects.toThrow('Stok tidak mencukupi')
    })

    it('throws when credit limit exceeded', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'confirmed', customerId: 'cust-1', paymentMethod: 'credit',
        totalAmount: '5000000', orderNumber: 'SO-202604-0001', taxPct: '0', subtotal: '5000000', taxAmount: '0',
      } as any) // any: partial mock
      vi.mocked(soQ.findSalesOrderItems).mockResolvedValue([
        { id: 'item-1', itemType: 'egg_grade_a', quantity: 100, unit: 'butir', pricePerUnit: '50000', discountPct: '0', subtotal: '5000000' },
      ] as any) // any: partial mock
      vi.mocked(invQ.getStockBalanceByGrade).mockResolvedValue(10000)
      vi.mocked(soQ.getCustomerOutstandingCredit).mockResolvedValue(5000000)
      vi.mocked(retQ.findInvoiceByOrderId).mockResolvedValue(null)

      // Customer creditLimit - outstanding < totalAmount
      await expect(fulfillSO('so-1', 'user-1', 'supervisor')).rejects.toThrow('Credit limit')
    })

    it('throws when role is operator', async () => {
      await expect(fulfillSO('so-1', 'user-1', 'operator')).rejects.toThrow('Tidak diizinkan')
    })
  })
})
```

Run: `npx vitest run lib/services/sales-order.service.test.ts` — expect failures (no service yet).

### Task 4.2 — Create `lib/services/sales-order.service.ts`

Implement all functions to pass the tests:

```ts
import {
  findSalesOrderById,
  findSalesOrderItems,
  countSalesOrdersThisMonth,
  insertSalesOrderWithItems,
  updateSalesOrderStatus,
  deleteDraftSO,
  fulfillSOTx,
  getCustomerOutstandingCredit,
} from '@/lib/db/queries/sales-order.queries'
import { findInvoiceByOrderId } from '@/lib/db/queries/sales-return.queries'
import { getStockBalanceByGrade } from '@/lib/db/queries/inventory.queries'
import { findCustomerById } from '@/lib/db/queries/customer.queries'
import { generateOrderNumber } from '@/lib/utils/order-number'
import type { NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'

type CreateSOInput = {
  customerId: string
  orderDate: Date
  paymentMethod: 'cash' | 'credit'
  items: {
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    description?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
    pricePerUnit: string
    discountPct: string
  }[]
  taxPct: string
  notes?: string
  overrideReason?: string
}

function validateRole(role: string, allowed: string[]): void {
  if (!allowed.includes(role)) throw new Error('Tidak diizinkan')
}

export async function createDraftSO(
  input: CreateSOInput,
  userId: string,
  role: string
) {
  validateRole(role, ['supervisor', 'admin'])

  if (!input.items || input.items.length === 0) {
    throw new Error('Item pesanan tidak boleh kosong')
  }

  const customer = await findCustomerById(input.customerId)
  if (!customer) throw new Error('Pelanggan tidak ditemukan')

  if (customer.status === 'blocked') {
    if (!input.overrideReason) throw new Error('Pelanggan diblokir')
    if (role !== 'admin') throw new Error('Pelanggan diblokir')
  }

  // Calculate totals
  const items: NewSalesOrderItem[] = input.items.map(i => {
    const qty = i.quantity
    const price = Number(i.pricePerUnit)
    const disc = Number(i.discountPct)
    const subtotal = qty * price * (1 - disc / 100)
    return {
      itemType: i.itemType,
      itemRefId: i.itemRefId,
      description: i.description,
      quantity: qty,
      unit: i.unit,
      pricePerUnit: i.pricePerUnit,
      discountPct: i.discountPct,
      subtotal: subtotal.toFixed(2),
    }
  })

  const subtotal = items.reduce((sum, i) => sum + Number(i.subtotal), 0)
  const taxPct = Number(input.taxPct)
  const taxAmount = subtotal * taxPct / 100
  const totalAmount = subtotal + taxAmount

  const lastSeq = await countSalesOrdersThisMonth('SO')
  const orderNumber = generateOrderNumber('SO', lastSeq)

  const notes = input.overrideReason
    ? `${input.notes ? input.notes + ' | ' : ''}[OVERRIDE] ${input.overrideReason}`
    : input.notes

  const order: NewSalesOrder = {
    orderNumber,
    orderDate: input.orderDate,
    customerId: input.customerId,
    paymentMethod: input.paymentMethod,
    status: 'draft',
    taxPct: input.taxPct,
    subtotal: subtotal.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2),
    notes,
    createdBy: userId,
  }

  return insertSalesOrderWithItems(order, items)
}

export async function confirmSO(orderId: string, userId: string, role: string): Promise<void> {
  validateRole(role, ['supervisor', 'admin'])
  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('Pesanan tidak ditemukan')
  if (so.status !== 'draft') throw new Error('Status SO tidak valid untuk operasi ini')
  await updateSalesOrderStatus(orderId, 'confirmed', userId)
}

export async function cancelSO(orderId: string, userId: string, role: string): Promise<void> {
  validateRole(role, ['supervisor', 'admin'])
  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('Pesanan tidak ditemukan')
  if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')
  await updateSalesOrderStatus(orderId, 'cancelled', userId)
}

export async function deleteDraftSO(orderId: string, userId: string, role: string): Promise<void> {
  validateRole(role, ['supervisor', 'admin'])
  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('Pesanan tidak ditemukan')
  if (so.status !== 'draft') throw new Error('Status SO tidak valid untuk operasi ini')
  await deleteDraftSO(orderId)
}

export async function fulfillSO(orderId: string, userId: string, role: string): Promise<void> {
  validateRole(role, ['supervisor', 'admin'])
  const so = await findSalesOrderById(orderId)
  if (!so) throw new Error('Pesanan tidak ditemukan')
  if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')

  const items = await findSalesOrderItems(orderId)

  // Check stock for egg items
  for (const item of items) {
    if (item.itemType === 'egg_grade_a' || item.itemType === 'egg_grade_b') {
      const grade = item.itemType === 'egg_grade_a' ? 'A' as const : 'B' as const
      const balance = await getStockBalanceByGrade(grade)
      if (balance < item.quantity) {
        throw new Error('Stok tidak mencukupi saat transaksi diproses')
      }
    }
  }

  // Check credit limit for credit sales
  if (so.paymentMethod === 'credit') {
    const customer = await findCustomerById(so.customerId)
    if (customer) {
      const outstanding = await getCustomerOutstandingCredit(so.customerId)
      const creditLimit = Number(customer.creditLimit)
      if (outstanding + Number(so.totalAmount) > creditLimit) {
        throw new Error('Credit limit pelanggan terlampaui')
      }
    }
  }

  // Build movements
  const movements: NewInventoryMovement[] = items
    .filter(i => i.itemType === 'egg_grade_a' || i.itemType === 'egg_grade_b')
    .map(i => ({
      flockId: null,
      movementType: 'out' as const,
      source: 'sale' as const,
      sourceType: 'sales_order_items' as const,
      sourceId: i.id,
      grade: i.itemType === 'egg_grade_a' ? 'A' as const : 'B' as const,
      quantity: i.quantity,
      movementDate: so.orderDate,
      createdBy: userId,
    }))

  // Build flock updates
  const flockUpdates = items
    .filter(i => i.itemType === 'flock' && i.itemRefId)
    .map(i => ({
      flockId: i.itemRefId!,
      status: 'sold',
      retiredAt: new Date(),
    }))

  // Build invoice
  const lastSeq = await countInvoicesThisMonth(so.paymentMethod === 'cash' ? 'RCP' : 'INV')
  const invoicePrefix = so.paymentMethod === 'cash' ? 'RCP' : 'INV'
  const invoiceNumber = generateOrderNumber(invoicePrefix, lastSeq)
  const today = new Date()

  const invoice: NewInvoice = so.paymentMethod === 'cash'
    ? {
        invoiceNumber,
        type: 'cash_receipt',
        orderId,
        customerId: so.customerId,
        issueDate: today,
        dueDate: today,
        totalAmount: so.totalAmount,
        paidAmount: so.totalAmount,
        status: 'paid',
        createdBy: userId,
      }
    : {
        invoiceNumber,
        type: 'sales_invoice',
        orderId,
        customerId: so.customerId,
        issueDate: today,
        dueDate: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        totalAmount: so.totalAmount,
        paidAmount: '0',
        status: 'sent',
        createdBy: userId,
      }

  await fulfillSOTx(orderId, userId, movements, invoice, flockUpdates)
}

async function countInvoicesThisMonth(prefix: string): Promise<number> {
  // Import dynamically to avoid circular deps
  const { countInvoicesThisMonth: cnt } = await import('@/lib/db/queries/invoice.queries')
  return cnt(prefix)
}
```

Run: `npx vitest run lib/services/sales-order.service.test.ts` — should pass.

### Task 4.3 — Create `lib/db/queries/customer.queries.ts`

Needed by sales-order.service:

```ts
import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Customer } from '@/lib/db/schema'

export async function findCustomerById(id: string): Promise<Customer | null> {
  const [row] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  return row ?? null
}

export async function listCustomers(): Promise<Customer[]> {
  return db.select().from(customers)
}
```

### Task 4.4 — Create `lib/db/queries/invoice.queries.ts`

Needed by sales-order.service:

```ts
import { db } from '@/lib/db'
import { invoices } from '@/lib/db/schema'
import { eq, sql, count } from 'drizzle-orm'
import type { Invoice } from '@/lib/db/schema'

export async function countInvoicesThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ cnt: count() })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} LIKE ${pattern}`)
  return row?.cnt ?? 0
}

export async function findInvoiceByOrderId(orderId: string): Promise<Invoice | null> {
  const [row] = await db.select().from(invoices).where(eq(invoices.orderId, orderId)).limit(1)
  return row ?? null
}
```

### Task 4.5 — Write `lib/services/sales-return.service.test.ts`

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/sales-return.queries', () => ({
  findSalesReturnById: vi.fn(),
  findSalesReturnItems: vi.fn(),
  countSalesReturnsThisMonth: vi.fn(),
  insertSalesReturnWithItems: vi.fn(),
  approveSalesReturnTx: vi.fn(),
  rejectSalesReturn: vi.fn(),
  findInvoiceByOrderId: vi.fn(),
}))

vi.mock('@/lib/db/queries/sales-order.queries', () => ({
  findSalesOrderById: vi.fn(),
  findSalesOrderItems: vi.fn(),
}))

import * as retQ from '@/lib/db/queries/sales-return.queries'
import * as soQ from '@/lib/db/queries/sales-order.queries'
import {
  createSalesReturn,
  approveSalesReturn,
  rejectSalesReturn,
} from './sales-return.service'

describe('sales-return.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createSalesReturn', () => {
    it('creates return for fulfilled SO', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'fulfilled', customerId: 'cust-1',
      } as any) // any: partial mock
      vi.mocked(soQ.findSalesOrderItems).mockResolvedValue([
        { id: 'item-1', itemType: 'egg_grade_a', quantity: 100 },
      ] as any) // any: partial mock
      vi.mocked(retQ.countSalesReturnsThisMonth).mockResolvedValue(0)
      vi.mocked(retQ.insertSalesReturnWithItems).mockResolvedValue({
        id: 'ret-1', returnNumber: 'RTN-202604-0001', status: 'pending',
      } as any) // any: partial mock

      const result = await createSalesReturn({
        orderId: 'so-1',
        returnDate: new Date('2026-04-23'),
        reasonType: 'damaged',
        items: [{ itemType: 'egg_grade_a', quantity: 10, unit: 'butir' }],
        notes: 'Telur pecah saat pengiriman',
      }, 'user-1', 'supervisor')

      expect(result.returnNumber).toBe('RTN-202604-0001')
    })

    it('throws when SO not fulfilled', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'confirmed',
      } as any) // any: partial mock

      await expect(
        createSalesReturn({
          orderId: 'so-1', returnDate: new Date(), reasonType: 'damaged',
          items: [{ itemType: 'egg_grade_a', quantity: 10, unit: 'butir' }],
        }, 'user-1', 'supervisor')
      ).rejects.toThrow('Return hanya bisa dibuat untuk SO yang sudah fulfilled')
    })

    it('throws when return qty exceeds SO qty', async () => {
      vi.mocked(soQ.findSalesOrderById).mockResolvedValue({
        id: 'so-1', status: 'fulfilled', customerId: 'cust-1',
      } as any) // any: partial mock
      vi.mocked(soQ.findSalesOrderItems).mockResolvedValue([
        { id: 'item-1', itemType: 'egg_grade_a', quantity: 100 },
      ] as any) // any: partial mock

      await expect(
        createSalesReturn({
          orderId: 'so-1', returnDate: new Date(), reasonType: 'damaged',
          items: [{ itemType: 'egg_grade_a', quantity: 150, unit: 'butir' }],
        }, 'user-1', 'supervisor')
      ).rejects.toThrow('Jumlah return melebihi jumlah SO asli')
    })

    it('throws when role is operator', async () => {
      await expect(
        createSalesReturn({
          orderId: 'so-1', returnDate: new Date(), reasonType: 'damaged',
          items: [{ itemType: 'egg_grade_a', quantity: 10, unit: 'butir' }],
        }, 'user-1', 'operator')
      ).rejects.toThrow('Tidak diizinkan')
    })
  })

  describe('approveSalesReturn', () => {
    it('calls approveSalesReturnTx for pending return', async () => {
      vi.mocked(retQ.findSalesReturnById).mockResolvedValue({
        id: 'ret-1', status: 'pending', orderId: 'so-1', customerId: 'cust-1',
      } as any) // any: partial mock
      vi.mocked(retQ.findSalesReturnItems).mockResolvedValue([
        { id: 'ri-1', itemType: 'egg_grade_a', quantity: 10 },
      ] as any) // any: partial mock
      vi.mocked(retQ.findInvoiceByOrderId).mockResolvedValue({
        id: 'inv-1', invoiceNumber: 'INV-202604-0001',
      } as any) // any: partial mock
      vi.mocked(retQ.approveSalesReturnTx).mockResolvedValue(undefined)

      await approveSalesReturn('ret-1', 'admin-1', 'admin')

      expect(retQ.approveSalesReturnTx).toHaveBeenCalled()
    })

    it('throws when role is not admin', async () => {
      await expect(
        approveSalesReturn('ret-1', 'user-1', 'supervisor')
      ).rejects.toThrow('Tidak diizinkan')
    })

    it('throws when return not in pending status', async () => {
      vi.mocked(retQ.findSalesReturnById).mockResolvedValue({
        id: 'ret-1', status: 'approved',
      } as any) // any: partial mock

      await expect(
        approveSalesReturn('ret-1', 'admin-1', 'admin')
      ).rejects.toThrow('Return sudah diproses')
    })
  })

  describe('rejectSalesReturn', () => {
    it('updates status to rejected', async () => {
      vi.mocked(retQ.findSalesReturnById).mockResolvedValue({
        id: 'ret-1', status: 'pending',
      } as any) // any: partial mock
      vi.mocked(retQ.rejectSalesReturn).mockResolvedValue(undefined)

      await rejectSalesReturn('ret-1', 'admin-1', 'admin')

      expect(retQ.rejectSalesReturn).toHaveBeenCalledWith('ret-1', 'admin-1')
    })

    it('throws when role is not admin', async () => {
      await expect(
        rejectSalesReturn('ret-1', 'user-1', 'supervisor')
      ).rejects.toThrow('Tidak diizinkan')
    })
  })
})
```

Run: `npx vitest run lib/services/sales-return.service.test.ts` — expect failures.

### Task 4.6 — Create `lib/services/sales-return.service.ts`

```ts
import {
  findSalesReturnById,
  findSalesReturnItems,
  countSalesReturnsThisMonth,
  insertSalesReturnWithItems,
  approveSalesReturnTx,
  rejectSalesReturn,
  findInvoiceByOrderId,
} from '@/lib/db/queries/sales-return.queries'
import { findSalesOrderById, findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'
import { generateOrderNumber } from '@/lib/utils/order-number'
import type { NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'

type CreateReturnInput = {
  orderId: string
  returnDate: Date
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  items: {
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
  }[]
  notes?: string
}

export async function createSalesReturn(
  input: CreateReturnInput,
  userId: string,
  role: string
) {
  if (!['supervisor', 'admin'].includes(role)) throw new Error('Tidak diizinkan')

  const so = await findSalesOrderById(input.orderId)
  if (!so) throw new Error('Pesanan tidak ditemukan')
  if (so.status !== 'fulfilled') throw new Error('Return hanya bisa dibuat untuk SO yang sudah fulfilled')

  const soItems = await findSalesOrderItems(input.orderId)

  // Validate return quantities
  for (const item of input.items) {
    const soItem = soItems.find(si => si.itemType === item.itemType)
    if (!soItem || item.quantity > soItem.quantity) {
      throw new Error('Jumlah return melebihi jumlah SO asli')
    }
  }

  const lastSeq = await countSalesReturnsThisMonth('RTN')
  const returnNumber = generateOrderNumber('RTN', lastSeq)

  const returnItems: NewSalesReturnItem[] = input.items.map(i => ({
    itemType: i.itemType,
    itemRefId: i.itemRefId,
    quantity: i.quantity,
    unit: i.unit,
  }))

  const ret: NewSalesReturn = {
    returnNumber,
    orderId: input.orderId,
    customerId: so.customerId,
    returnDate: input.returnDate,
    reasonType: input.reasonType,
    notes: input.notes,
    status: 'pending',
    submittedBy: userId,
  }

  return insertSalesReturnWithItems(ret, returnItems)
}

export async function approveSalesReturn(
  returnId: string,
  userId: string,
  role: string
): Promise<void> {
  if (role !== 'admin') throw new Error('Tidak diizinkan')

  const ret = await findSalesReturnById(returnId)
  if (!ret) throw new Error('Return tidak ditemukan')
  if (ret.status !== 'pending') throw new Error('Return sudah diproses')

  const items = await findSalesReturnItems(returnId)

  // Build inventory movements
  const movements: NewInventoryMovement[] = items
    .filter(i => i.itemType === 'egg_grade_a' || i.itemType === 'egg_grade_b')
    .map(i => ({
      flockId: null,
      movementType: 'in' as const,
      source: 'sale' as const,
      sourceType: 'sales_returns' as const,
      sourceId: returnId,
      grade: i.itemType === 'egg_grade_a' ? 'A' as const : 'B' as const,
      quantity: i.quantity,
      movementDate: ret.returnDate,
      createdBy: userId,
    }))

  // Get original invoice for reference
  const originalInvoice = await findInvoiceByOrderId(ret.orderId)

  // Generate CN number
  const { countInvoicesThisMonth } = await import('@/lib/db/queries/invoice.queries')
  const lastSeq = await countInvoicesThisMonth('CN')
  const cnNumber = generateOrderNumber('CN', lastSeq)

  const totalReturnAmount = movements.reduce((sum, m) => {
    // Use original SO price to calculate return value
    return sum
  }, 0)

  // Build credit note invoice
  const creditNote: NewInvoice = {
    invoiceNumber: cnNumber,
    type: 'credit_note',
    orderId: ret.orderId,
    referenceInvoiceId: originalInvoice?.id,
    returnId,
    customerId: ret.customerId,
    issueDate: new Date(),
    dueDate: new Date(),
    totalAmount: `-${ret.totalReturnAmount ?? '0'}`, // negative
    paidAmount: '0',
    status: 'sent',
    createdBy: userId,
  }

  // Build customer credit
  const customerCredit: NewCustomerCredit = {
    customerId: ret.customerId,
    amount: ret.totalReturnAmount ?? '0', // positive
    sourceType: 'credit_note',
    sourceInvoiceId: undefined, // will be set after invoice insert — handled in tx
    notes: `Credit from return ${ret.returnNumber}`,
  }

  await approveSalesReturnTx(returnId, userId, movements, creditNote, customerCredit)
}

export async function rejectSalesReturn(
  returnId: string,
  userId: string,
  role: string
): Promise<void> {
  if (role !== 'admin') throw new Error('Tidak diizinkan')

  const ret = await findSalesReturnById(returnId)
  if (!ret) throw new Error('Return tidak ditemukan')
  if (ret.status !== 'pending') throw new Error('Return sudah diproses')

  await rejectSalesReturn(returnId, userId)
}
```

Run: `npx vitest run lib/services/sales-return.service.test.ts` — should pass.

### Task 4.7 — Run all service tests

```bash
npx vitest run lib/services/
```

All tests must pass before proceeding.

---

## Phase 5: Actions Layer

### Task 5.1 — Create `lib/actions/sales-order.actions.ts`

```ts
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import {
  createDraftSO,
  confirmSO,
  cancelSO,
  deleteDraftSO,
  fulfillSO,
} from '@/lib/services/sales-order.service'
import { listSalesOrders, findSalesOrderById, findSalesOrderItems } from '@/lib/db/queries/sales-order.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const createSOSchema = z.object({
  customerId: z.string().uuid(),
  orderDate: z.coerce.date(),
  paymentMethod: z.enum(['cash', 'credit']),
  taxPct: z.string().default('0'),
  notes: z.string().optional(),
  overrideReason: z.string().optional(),
})

const soItemSchema = z.object({
  itemType: z.enum(['egg_grade_a', 'egg_grade_b', 'flock', 'other']),
  itemRefId: z.string().uuid().optional(),
  description: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  unit: z.enum(['butir', 'ekor', 'unit']),
  pricePerUnit: z.string(),
  discountPct: z.string().default('0'),
})

export async function createDraftSOAction(
  formData: FormData
): Promise<ActionResult<{ id: string; orderNumber: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = createSOSchema.safeParse({
    customerId: formData.get('customerId'),
    orderDate: formData.get('orderDate'),
    paymentMethod: formData.get('paymentMethod'),
    taxPct: formData.get('taxPct'),
    notes: formData.get('notes') || undefined,
    overrideReason: formData.get('overrideReason') || undefined,
  })
  if (!parsed.success) return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }

  // Parse items from JSON string
  const itemsRaw = formData.get('items')
  if (!itemsRaw || typeof itemsRaw !== 'string') {
    return { success: false, error: 'Item pesanan tidak boleh kosong' }
  }

  let items: unknown[]
  try {
    items = JSON.parse(itemsRaw)
  } catch {
    return { success: false, error: 'Format item tidak valid' }
  }

  const itemsParsed = z.array(soItemSchema).safeParse(items)
  if (!itemsParsed.success) return { success: false, error: 'Format item tidak valid' }

  try {
    const result = await createDraftSO(
      { ...parsed.data, items: itemsParsed.data },
      session.id,
      session.role
    )
    return { success: true, data: { id: result.id, orderNumber: result.orderNumber } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat pesanan penjualan' }
  }
}

export async function confirmSOAction(orderId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await confirmSO(orderId, session.id, session.role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal mengkonfirmasi pesanan' }
  }
}

export async function cancelSOAction(orderId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await cancelSO(orderId, session.id, session.role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membatalkan pesanan' }
  }
}

export async function deleteDraftSOAction(orderId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await deleteDraftSO(orderId, session.id, session.role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menghapus pesanan' }
  }
}

export async function fulfillSOAction(orderId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await fulfillSO(orderId, session.id, session.role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memproses pesanan' }
  }
}

export async function getSalesOrdersAction(
  page?: number,
  status?: string
): Promise<ActionResult<{ data: any[]; total: number }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const result = await listSalesOrders(page, undefined, status)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat daftar pesanan' }
  }
}

export async function getSalesOrderDetailAction(
  orderId: string
): Promise<ActionResult<any>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const order = await findSalesOrderById(orderId)
    if (!order) return { success: false, error: 'Pesanan tidak ditemukan' }
    const items = await findSalesOrderItems(orderId)
    return { success: true, data: { ...order, items } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat detail pesanan' }
  }
}
```

### Task 5.2 — Create `lib/actions/sales-return.actions.ts`

```ts
'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import {
  createSalesReturn,
  approveSalesReturn,
  rejectSalesReturn,
} from '@/lib/services/sales-return.service'
import { findSalesReturnById, findSalesReturnItems, listSalesReturns } from '@/lib/db/queries/sales-return.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const createReturnSchema = z.object({
  orderId: z.string().uuid(),
  returnDate: z.coerce.date(),
  reasonType: z.enum(['wrong_grade', 'damaged', 'quantity_error', 'other']),
  notes: z.string().optional(),
})

const returnItemSchema = z.object({
  itemType: z.enum(['egg_grade_a', 'egg_grade_b', 'flock', 'other']),
  itemRefId: z.string().uuid().optional(),
  quantity: z.coerce.number().int().positive(),
  unit: z.enum(['butir', 'ekor', 'unit']),
})

export async function createSalesReturnAction(
  formData: FormData
): Promise<ActionResult<{ id: string; returnNumber: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = createReturnSchema.safeParse({
    orderId: formData.get('orderId'),
    returnDate: formData.get('returnDate'),
    reasonType: formData.get('reasonType'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }

  const itemsRaw = formData.get('items')
  if (!itemsRaw || typeof itemsRaw !== 'string') {
    return { success: false, error: 'Item return tidak boleh kosong' }
  }

  let items: unknown[]
  try {
    items = JSON.parse(itemsRaw)
  } catch {
    return { success: false, error: 'Format item tidak valid' }
  }

  const itemsParsed = z.array(returnItemSchema).safeParse(items)
  if (!itemsParsed.success) return { success: false, error: 'Format item tidak valid' }

  try {
    const result = await createSalesReturn(
      { ...parsed.data, items: itemsParsed.data },
      session.id,
      session.role
    )
    return { success: true, data: { id: result.id, returnNumber: result.returnNumber } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat return penjualan' }
  }
}

export async function approveSalesReturnAction(returnId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await approveSalesReturn(returnId, session.id, session.role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyetujui return' }
  }
}

export async function rejectSalesReturnAction(returnId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    await rejectSalesReturn(returnId, session.id, session.role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menolak return' }
  }
}

export async function getSalesReturnDetailAction(
  returnId: string
): Promise<ActionResult<any>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const ret = await findSalesReturnById(returnId)
    if (!ret) return { success: false, error: 'Return tidak ditemukan' }
    const items = await findSalesReturnItems(returnId)
    return { success: true, data: { ...ret, items } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat detail return' }
  }
}
```

---

## Phase 6: UI Components

### Task 6.1 — Create `components/sales/so-status-badge.tsx`

```tsx
// client: uses CSS vars dynamically via style prop
export function SOStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cssVar: string }> = {
    draft: { label: 'Draft', cssVar: 'var(--lf-text-soft)' },
    confirmed: { label: 'Dikonfirmasi', cssVar: 'var(--lf-blue)' },
    fulfilled: { label: 'Terpenuhi', cssVar: 'var(--lf-teal)' },
    cancelled: { label: 'Dibatalkan', cssVar: 'var(--lf-danger-text)' },
  }
  const c = config[status] ?? { label: status, cssVar: 'var(--lf-text-soft)' }
  return (
    <span
      className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold"
      style={{ color: c.cssVar, backgroundColor: `color-mix(in srgb, ${c.cssVar} 12%, transparent)` }}
    >
      {c.label}
    </span>
  )
}
```

### Task 6.2 — Create `components/sales/so-item-row.tsx`

```tsx
// client: needs onChange handlers for dynamic item rows
'use client'

import type { SalesOrderItem } from '@/lib/db/schema'

type Props = {
  item: SalesOrderItem
  index: number
  onChange: (index: number, field: string, value: string) => void
  onRemove: (index: number) => void
}

export function SOItemRow({ item, index, onChange, onRemove }: Props) {
  return (
    <tr>
      <td className="p-2">
        <select
          value={item.itemType}
          onChange={e => onChange(index, 'itemType', e.target.value)}
          className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
          style={{ borderRadius: '10px' }}
        >
          <option value="egg_grade_a">Telur Grade A</option>
          <option value="egg_grade_b">Telur Grade B</option>
          <option value="flock">Flock</option>
          <option value="other">Lainnya</option>
        </select>
      </td>
      <td className="p-2">
        <input
          type="number"
          value={item.quantity}
          onChange={e => onChange(index, 'quantity', e.target.value)}
          className="w-24 rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
          style={{ borderRadius: '10px' }}
          min={1}
        />
      </td>
      <td className="p-2">
        <select
          value={item.unit}
          onChange={e => onChange(index, 'unit', e.target.value)}
          className="w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
          style={{ borderRadius: '10px' }}
        >
          <option value="butir">Butir</option>
          <option value="ekor">Ekor</option>
          <option value="unit">Unit</option>
        </select>
      </td>
      <td className="p-2">
        <input
          type="text"
          value={item.pricePerUnit}
          onChange={e => onChange(index, 'pricePerUnit', e.target.value)}
          className="w-32 rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
          style={{ borderRadius: '10px' }}
        />
      </td>
      <td className="p-2">
        <input
          type="text"
          value={item.discountPct}
          onChange={e => onChange(index, 'discountPct', e.target.value)}
          className="w-20 rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
          style={{ borderRadius: '10px' }}
        />
      </td>
      <td className="p-2 text-sm text-right font-medium">
        Rp {Number(item.subtotal).toLocaleString('id-ID')}
      </td>
      <td className="p-2">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-sm px-2 py-1 rounded-lg hover:bg-red-50"
          style={{ color: 'var(--lf-danger-text)' }}
        >
          Hapus
        </button>
      </td>
    </tr>
  )
}
```

### Task 6.3 — Create `components/sales/so-summary-footer.tsx`

```tsx
type Props = {
  subtotal: number
  taxPct: number
  taxAmount: number
  totalAmount: number
  onTaxPctChange: (val: string) => void
}

export function SOSummaryFooter({ subtotal, taxPct, taxAmount, totalAmount, onTaxPctChange }: Props) {
  return (
    <div className="border-t pt-4 mt-4 space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
      </div>
      <div className="flex justify-between items-center">
        <span>PPN (%)</span>
        <input
          type="text"
          value={taxPct}
          onChange={e => onTaxPctChange(e.target.value)}
          className="w-20 rounded-lg border border-[#d1d5db] px-3 py-1 text-sm text-right"
          style={{ borderRadius: '10px' }}
        />
      </div>
      <div className="flex justify-between">
        <span>Pajak</span>
        <span className="font-medium">Rp {taxAmount.toLocaleString('id-ID')}</span>
      </div>
      <div className="flex justify-between text-base font-bold pt-2 border-t">
        <span>Total</span>
        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
      </div>
    </div>
  )
}
```

### Task 6.4 — Create `components/sales/return-item-row.tsx`

```tsx
type Props = {
  itemType: string
  maxQty: number
  quantity: number
  unit: string
  onChange: (qty: number) => void
}

export function ReturnItemRow({ itemType, maxQty, quantity, unit, onChange }: Props) {
  const labels: Record<string, string> = {
    egg_grade_a: 'Telur Grade A',
    egg_grade_b: 'Telur Grade B',
    flock: 'Flock',
    other: 'Lainnya',
  }
  return (
    <div className="flex items-center gap-4 py-2">
      <span className="flex-1 text-sm">{labels[itemType] ?? itemType}</span>
      <span className="text-xs" style={{ color: 'var(--lf-text-soft)' }}>Maks: {maxQty}</span>
      <input
        type="number"
        value={quantity}
        onChange={e => onChange(Math.min(Number(e.target.value), maxQty))}
        className="w-24 rounded-lg border border-[#d1d5db] px-3 py-2 text-sm"
        style={{ borderRadius: '10px' }}
        min={0}
        max={maxQty}
      />
      <span className="text-sm">{unit}</span>
    </div>
  )
}
```

---

## Phase 7: UI Pages

### Task 7.1 — Replace `app/(app)/penjualan/page.tsx` — SO list

Server Component. Displays SO list with status filter, pagination, link to create new.

```tsx
import Link from 'next/link'
import { getSalesOrdersAction } from '@/lib/actions/sales-order.actions'
import { SOStatusBadge } from '@/components/sales/so-status-badge'

export default async function PenjualanPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string }
}) {
  const page = Number(searchParams.page ?? 1)
  const status = searchParams.status
  const result = await getSalesOrdersAction(page, status)

  if (!result.success) {
    return <div className="p-6 text-red-600">{result.error}</div>
  }

  const { data: orders, total } = result.data
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[18px] font-bold" style={{ color: '#2d3a2e', letterSpacing: '-0.3px' }}>
          Penjualan
        </h1>
        <Link
          href="/penjualan/new"
          className="px-4 py-2 text-sm font-semibold text-white rounded-[10px]"
          style={{ backgroundColor: 'var(--lf-blue)' }}
        >
          + Pesanan Baru
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'draft', 'confirmed', 'fulfilled', 'cancelled'].map(s => (
          <Link
            key={s}
            href={`/penjualan${s === 'all' ? '' : `?status=${s}`}`}
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: (!status && s === 'all') || status === s ? 'var(--lf-blue)' : 'transparent',
              color: (!status && s === 'all') || status === s ? '#fff' : 'var(--lf-text-soft)',
              border: `1px solid ${(!status && s === 'all') || status === s ? 'var(--lf-blue)' : '#d1d5db'}`,
            }}
          >
            {s === 'all' ? 'Semua' : s.charAt(0).toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[16px] shadow-lf-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ color: 'var(--lf-text-soft)' }}>
              <th className="text-left p-3 font-medium">Nomor SO</th>
              <th className="text-left p-3 font-medium">Tanggal</th>
              <th className="text-left p-3 font-medium">Pelanggan</th>
              <th className="text-right p-3 font-medium">Total</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-6" style={{ color: 'var(--lf-text-soft)' }}>
                  Belum ada pesanan penjualan
                </td>
              </tr>
            ) : (
              orders.map((so: any) => (
                <tr key={so.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">{so.orderNumber}</td>
                  <td className="p-3">{so.orderDate?.toLocaleDateString('id-ID')}</td>
                  <td className="p-3">{so.customerId}</td>
                  <td className="p-3 text-right">Rp {Number(so.totalAmount).toLocaleString('id-ID')}</td>
                  <td className="p-3 text-center"><SOStatusBadge status={so.status} /></td>
                  <td className="p-3 text-center">
                    <Link href={`/penjualan/${so.id}`} className="text-sm font-medium" style={{ color: 'var(--lf-blue)' }}>
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/penjualan?page=${p}${status ? `&status=${status}` : ''}`}
              className="px-3 py-1 rounded-lg text-sm"
              style={{
                backgroundColor: p === page ? 'var(--lf-blue)' : 'transparent',
                color: p === page ? '#fff' : 'var(--lf-text-soft)',
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Task 7.2 — Create `app/(app)/penjualan/new/page.tsx` — Create SO form

`'use client'` — needs onChange, sessionStorage, dynamic item rows.

Key features:
- Customer dropdown (fetched from server action)
- Item rows with add/remove
- sessionStorage draft persistence
- Blocked customer warning
- Price = 0 confirmation

### Task 7.3 — Create `app/(app)/penjualan/[id]/page.tsx` — SO detail

Server Component with client action buttons per status.

### Task 7.4 — Create `app/(app)/penjualan/[id]/return/new/page.tsx` — Create return form

`'use client'`. Items pre-populated from SO items, quantity editable.

### Task 7.5 — Create `app/(app)/penjualan/return/[id]/page.tsx` — Return detail

Admin-only approve/reject buttons with confirmation dialogs.

---

## Phase 8: Update existing code for inventory_movements refactor

### Task 8.1 — Update `lib/db/queries/inventory.queries.ts`

Change all references from old schema to new:
- `movementType: 'IN'` → `movementType: 'in'`
- `movementType: 'OUT'` → `movementType: 'out'`
- `referenceType` → `sourceType` (with new enum values)
- `referenceId` → `sourceId`
- Add `source` field

### Task 8.2 — Update `lib/services/stock.service.ts`

Update function calls to use new schema column names.

### Task 8.3 — Update `lib/actions/stock.actions.ts`

No changes needed (actions delegate to service, no direct DB access).

### Task 8.4 — Run existing stock tests to verify refactor didn't break

```bash
npx vitest run lib/services/stock.service.test.ts
```

---

## Phase 9: Documentation

### Task 9.1 — Create `docs/unit-test/sprint5-unit-tests.md`

List all unit tests for Sprint 5:
- `sales-order.service.test.ts`: all test cases from spec
- `sales-return.service.test.ts`: all test cases from spec
- `order-number.test.ts`: format, padding, monthly reset

### Task 9.2 — Create `docs/test-case/sprint5-uat.md`

UAT scenarios from spec:
- Operator blocked from SO creation
- Full SO flow draft → confirmed → fulfilled (cash)
- Credit SO flow with invoice
- Admin blocked customer override
- Concurrent fulfill race condition
- Insufficient stock at fulfill
- Credit limit exceeded
- Sales return creation
- Admin approves return (inventory IN + credit note + customer credits)
- Admin rejects return (no changes)
- sessionStorage draft persistence
- Price = 0 confirmation dialog

---

## Phase 10: Final verification

### Task 10.1 — Run all tests

```bash
npx vitest run
```

### Task 10.2 — Run build

```bash
npm run build
```

### Task 10.3 — Run lint

```bash
npm run lint
```

---

## Execution Notes

- **Dependencies between phases:** 1→2→3→4→5→6→7, 8 can run after 1, 9 can run after 4
- **Phase 3 query layer** needs customer.queries.ts and invoice.queries.ts — created inline during Phase 3/4
- **fulfillSOTx** and **approveSalesReturnTx** use raw SQL `FOR UPDATE` — ensure postgres client supports it
- **Schema files** must be created before `db:generate` — drizzle-kit reads them
- **Test mocks** follow existing pattern: mock `lib/db/queries/` layer only
- **Customer name in SO list** requires JOIN — either add to query or denormalize into sales_orders
