import { pgTable, uuid, integer, date, timestamp, text, pgEnum } from 'drizzle-orm/pg-core'
import { stockItems } from './stock-items'
import { users } from './users'

export const regradeStatusEnum = pgEnum('regrade_status', ['PENDING', 'APPROVED', 'REJECTED'])

export const regradeRequests = pgTable('regrade_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromItemId: uuid('from_item_id').notNull().references(() => stockItems.id),
  toItemId: uuid('to_item_id').notNull().references(() => stockItems.id),
  quantity: integer('quantity').notNull(),
  requestDate: date('request_date').notNull(),
  status: regradeStatusEnum('status').notNull().default('PENDING'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type RegradeRequest = typeof regradeRequests.$inferSelect
export type NewRegradeRequest = typeof regradeRequests.$inferInsert
