import { pgTable, uuid, text, integer, date, timestamp, boolean } from 'drizzle-orm/pg-core'
import { coops } from './coops'
import { users } from './users'

export const flocks = pgTable('flocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  coopId: uuid('coop_id').notNull().references(() => coops.id),
  name: text('name').notNull(),
  arrivalDate: date('arrival_date', { mode: 'date' }).notNull(),
  initialCount: integer('initial_count').notNull(),
  breed: text('breed'),
  notes: text('notes'),
  retiredAt: timestamp('retired_at', { withTimezone: true }),
  isImported: boolean('is_imported').notNull().default(false),
  importedBy: uuid('imported_by').references(() => users.id),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Flock = typeof flocks.$inferSelect
export type NewFlock = typeof flocks.$inferInsert
