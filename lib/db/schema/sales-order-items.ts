import { pgTable, uuid, text, integer, numeric, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'

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