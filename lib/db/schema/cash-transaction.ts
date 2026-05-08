import { pgTable, uuid, text, numeric, date, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { cashAccounts } from './cash-account'
import { cashCategories } from './cash-category'

export const cashTransactions = pgTable('cash_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => cashAccounts.id),
  categoryId: uuid('category_id').notNull().references(() => cashCategories.id),
  transactionDate: date('transaction_date', { mode: 'date' }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description').notNull(),
  referenceNumber: text('reference_number'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type CashTransaction = typeof cashTransactions.$inferSelect
export type NewCashTransaction = typeof cashTransactions.$inferInsert
