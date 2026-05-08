import { pgTable, uuid, text, boolean, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const cashAccountTypeEnum = pgEnum('cash_account_type', ['cash', 'bank'])

export const cashAccounts = pgTable('cash_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: cashAccountTypeEnum('type').notNull().default('cash'),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  openingBalance: numeric('opening_balance', { precision: 15, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type CashAccount = typeof cashAccounts.$inferSelect
export type NewCashAccount = typeof cashAccounts.$inferInsert
