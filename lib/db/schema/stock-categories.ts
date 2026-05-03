import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const stockCategories = pgTable('stock_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  unit: text('unit').notNull(),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type StockCategory = typeof stockCategories.$inferSelect
export type NewStockCategory = typeof stockCategories.$inferInsert
