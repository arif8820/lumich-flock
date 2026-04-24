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