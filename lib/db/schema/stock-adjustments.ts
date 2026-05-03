import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { flocks } from './flocks'
import { users } from './users'

export const stockAdjustments = pgTable('stock_adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  flockId: uuid('flock_id').references(() => flocks.id),
  quantity: integer('quantity').notNull(),
  reason: text('reason').notNull(),
  notes: text('notes'),
  adjustmentDate: date('adjustment_date').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type StockAdjustment = typeof stockAdjustments.$inferSelect
export type NewStockAdjustment = typeof stockAdjustments.$inferInsert
