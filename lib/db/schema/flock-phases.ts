import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'

export const flockPhases = pgTable('flock_phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  minWeeks: integer('min_weeks').notNull(),
  maxWeeks: integer('max_weeks'),
  sortOrder: integer('sort_order').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type FlockPhase = typeof flockPhases.$inferSelect
export type NewFlockPhase = typeof flockPhases.$inferInsert
