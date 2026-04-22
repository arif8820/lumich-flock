import { pgTable, uuid, integer, date, timestamp, text } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const regradeRequests = pgTable('regrade_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  gradeFrom: text('grade_from', { enum: ['A', 'B'] }).notNull(),
  gradeTo: text('grade_to', { enum: ['A', 'B'] }).notNull(),
  quantity: integer('quantity').notNull(), // always positive
  status: text('status', { enum: ['PENDING', 'APPROVED', 'REJECTED'] }).notNull().default('PENDING'),
  requestDate: date('request_date', { mode: 'date' }).notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type RegradeRequest = typeof regradeRequests.$inferSelect
export type NewRegradeRequest = typeof regradeRequests.$inferInsert
