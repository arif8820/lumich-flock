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
