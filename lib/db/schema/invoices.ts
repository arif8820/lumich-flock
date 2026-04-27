import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { salesReturns } from './sales-returns'
import { customers } from './customers'
import { users } from './users'

export const invoiceTypeEnum = pgEnum('invoice_type', ['sales_invoice', 'cash_receipt', 'credit_note'])
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'])

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  type: invoiceTypeEnum('type').notNull(),
  orderId: uuid('order_id').references(() => salesOrders.id),
  referenceInvoiceId: uuid('reference_invoice_id'),
  returnId: uuid('return_id').references(() => salesReturns.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  issueDate: date('issue_date', { mode: 'date' }).notNull(),
  dueDate: date('due_date', { mode: 'date' }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: numeric('paid_amount', { precision: 15, scale: 2 }).default('0').notNull(),
  status: invoiceStatusEnum('status').notNull(),
  pdfUrl: text('pdf_url'),
  pdfGeneratedAt: timestamp('pdf_generated_at', { withTimezone: true }),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert