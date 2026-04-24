import { pgTable, uuid, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { payments } from './payments'
import { invoices } from './invoices'

export const creditSourceTypeEnum = pgEnum('credit_source_type', ['overpayment', 'credit_note'])

export const customerCredits = pgTable('customer_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  sourceType: creditSourceTypeEnum('source_type').notNull(),
  sourcePaymentId: uuid('source_payment_id').references(() => payments.id),
  sourceInvoiceId: uuid('source_invoice_id').references(() => invoices.id),
  usedAmount: numeric('used_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type CustomerCredit = typeof customerCredits.$inferSelect
export type NewCustomerCredit = typeof customerCredits.$inferInsert