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