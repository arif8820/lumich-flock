import { pgTable, uuid, integer, date, timestamp, boolean, text, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const dailyRecords = pgTable('daily_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  recordDate: date('record_date').notNull(),
  deaths: integer('deaths').notNull().default(0),
  culled: integer('culled').notNull().default(0),
  eggsCracked: integer('eggs_cracked').notNull().default(0),
  eggsAbnormal: integer('eggs_abnormal').notNull().default(0),
  isLateInput: boolean('is_late_input').notNull().default(false),
  notes: text('notes'),
  isImported: boolean('is_imported').notNull().default(false),
  importedBy: uuid('imported_by').references(() => users.id),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex('daily_records_flock_date_idx').on(t.flockId, t.recordDate)])

export type DailyRecord = typeof dailyRecords.$inferSelect
export type NewDailyRecord = typeof dailyRecords.$inferInsert
