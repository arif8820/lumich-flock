import { pgTable, uuid, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const cashFlowTypeEnum = pgEnum('cash_flow_type', ['income', 'expense'])

export const cashCategories = pgTable('cash_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: cashFlowTypeEnum('type').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type CashCategory = typeof cashCategories.$inferSelect
export type NewCashCategory = typeof cashCategories.$inferInsert
