import { pgTable, uuid, text, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { stockCategories } from './stock-categories'

export const stockItems = pgTable('stock_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => stockCategories.id),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [unique().on(t.categoryId, t.name)])

export type StockItem = typeof stockItems.$inferSelect
export type NewStockItem = typeof stockItems.$inferInsert
