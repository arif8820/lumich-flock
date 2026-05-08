import { pgTable, uuid, text, boolean, pgEnum } from 'drizzle-orm/pg-core'

export const cashCategoryTypeEnum = pgEnum('cash_category_type', ['in', 'out', 'both'])

export const cashCategories = pgTable('cash_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: cashCategoryTypeEnum('type').notNull(),
  isActive: boolean('is_active').notNull().default(true),
})

export type CashCategory = typeof cashCategories.$inferSelect
export type NewCashCategory = typeof cashCategories.$inferInsert
