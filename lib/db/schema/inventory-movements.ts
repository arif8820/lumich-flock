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
  sourceType: movementSourceTypeEnum('source_type'),
  sourceId: uuid('source_id'),
  quantity: integer('quantity').notNull(),
  movementDate: date('movement_date').notNull(),
  note: text('note'),
  isImported: boolean('is_imported').notNull().default(false),
  importedBy: uuid('imported_by').references(() => users.id),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert
