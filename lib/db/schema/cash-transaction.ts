import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { cashAccounts } from './cash-account'
import { cashCategories } from './cash-category'
import { users } from './users'

export const cashTransactionTypeEnum = pgEnum('cash_transaction_type', ['in', 'out', 'transfer_in', 'transfer_out'])

export const cashTransactions = pgTable('cash_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id').notNull().references(() => cashAccounts.id),
  type: cashTransactionTypeEnum('type').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  transactionDate: date('transaction_date', { mode: 'date' }).notNull(),
  categoryId: uuid('category_id').references(() => cashCategories.id),
  referenceNumber: text('reference_number'),
  description: text('description'),
  transferRefId: uuid('transfer_ref_id'), // self-ref — set after both rows inserted
  sourceType: text('source_type'), // 'invoice'|'sales_order'|null — integration hook
  sourceId: uuid('source_id'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type CashTransaction = typeof cashTransactions.$inferSelect
export type NewCashTransaction = typeof cashTransactions.$inferInsert
