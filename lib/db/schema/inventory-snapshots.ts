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
