import { pgTable, uuid, text, numeric, date, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { customers } from './customers'
import { users } from './users'

export const salesOrderStatusEnum = pgEnum('sales_order_status', ['draft', 'confirmed', 'fulfilled', 'cancelled'])
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'credit'])

export const salesOrders = pgTable('sales_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  orderDate: date('order_date', { mode: 'date' }).notNull(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  status: salesOrderStatusEnum('status').notNull().default('draft'),
  taxPct: numeric('tax_pct', { precision: 5, scale: 2 }).default('0').notNull(),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).notNull(),
  taxAmount: numeric('tax_amount', { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type SalesOrder = typeof salesOrders.$inferSelect
export type NewSalesOrder = typeof salesOrders.$inferInsert