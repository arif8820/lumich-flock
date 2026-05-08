import { pgTable, uuid, text, boolean, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const cashAccountTypeEnum = pgEnum('cash_account_type', ['cash', 'bank', 'ewallet'])

export const cashAccounts = pgTable('cash_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: cashAccountTypeEnum('type').notNull(),
  beginningBalance: numeric('beginning_balance', { precision: 15, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type CashAccount = typeof cashAccounts.$inferSelect
export type NewCashAccount = typeof cashAccounts.$inferInsert
