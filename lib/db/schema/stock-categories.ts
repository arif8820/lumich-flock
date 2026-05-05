import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const stockCategories = pgTable('stock_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  unit: text('unit').notNull(),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type StockCategory = typeof stockCategories.$inferSelect
export type NewStockCategory = typeof stockCategories.$inferInsert
