import { pgTable, uuid, text, integer, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const customerTypeEnum = pgEnum('customer_type', ['retail', 'wholesale', 'distributor'])
export const customerStatusEnum = pgEnum('customer_status', ['active', 'inactive', 'blocked'])

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: customerTypeEnum('type'),
  phone: text('phone'),
  address: text('address'),
  creditLimit: numeric('credit_limit', { precision: 15, scale: 2 }).default('0').notNull(),
  paymentTerms: integer('payment_terms').default(0).notNull(),
  status: customerStatusEnum('status').default('active').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
