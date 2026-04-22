import { pgTable, uuid, integer, date, timestamp, boolean, numeric, uniqueIndex } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const dailyRecords = pgTable('daily_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  recordDate: date('record_date', { mode: 'date' }).notNull(),
  deaths: integer('deaths').notNull().default(0),
  culled: integer('culled').notNull().default(0),
  eggsGradeA: integer('eggs_grade_a').notNull().default(0),
  eggsGradeB: integer('eggs_grade_b').notNull().default(0),
  eggsCracked: integer('eggs_cracked').notNull().default(0),
  eggsAbnormal: integer('eggs_abnormal').notNull().default(0),
  avgWeightKg: numeric('avg_weight_kg', { precision: 10, scale: 3 }),
  feedKg: numeric('feed_kg', { precision: 10, scale: 3 }),
  isLateInput: boolean('is_late_input').notNull().default(false),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
}, (table) => [
  uniqueIndex('daily_records_flock_date_unique').on(table.flockId, table.recordDate),
])

export type DailyRecord = typeof dailyRecords.$inferSelect
export type NewDailyRecord = typeof dailyRecords.$inferInsert
