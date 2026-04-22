import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  movementType: text('movement_type', { enum: ['IN', 'OUT'] }).notNull(),
  grade: text('grade', { enum: ['A', 'B'] }).notNull(), // cracked/abnormal written off at daily_records level, never enter ledger
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
