import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { invoices } from './invoices'
import { users } from './users'

export const paymentMethodTypeEnum = pgEnum('payment_method_type', ['cash', 'transfer', 'cheque', 'credit'])

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  paymentDate: date('payment_date', { mode: 'date' }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  method: paymentMethodTypeEnum('method').notNull(),
  referenceNumber: text('reference_number'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert