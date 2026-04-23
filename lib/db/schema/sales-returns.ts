import { pgTable, uuid, text, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { salesOrders } from './sales-orders'
import { customers } from './customers'
import { users } from './users'

export const salesReturnStatusEnum = pgEnum('sales_return_status', ['pending', 'approved', 'rejected'])
export const returnReasonTypeEnum = pgEnum('return_reason_type', ['wrong_grade', 'damaged', 'quantity_error', 'other'])

export const salesReturns = pgTable('sales_returns', {
  id: uuid('id').primaryKey().defaultRandom(),
  returnNumber: text('return_number').notNull().unique(),
  orderId: uuid('order_id').notNull().references(() => salesOrders.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  returnDate: date('return_date', { mode: 'date' }).notNull(),
  reasonType: returnReasonTypeEnum('reason_type').notNull(),
  notes: text('notes'),
  status: salesReturnStatusEnum('status').notNull().default('pending'),
  submittedBy: uuid('submitted_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type SalesReturn = typeof salesReturns.$inferSelect
export type NewSalesReturn = typeof salesReturns.$inferInsert