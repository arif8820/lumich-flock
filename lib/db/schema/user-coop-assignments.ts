import { pgTable, uuid, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { coops } from './coops'

export const userCoopAssignments = pgTable('user_coop_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  coopId: uuid('coop_id').notNull().references(() => coops.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqueUserCoop: unique().on(table.userId, table.coopId),
}))

export type UserCoopAssignment = typeof userCoopAssignments.$inferSelect
export type NewUserCoopAssignment = typeof userCoopAssignments.$inferInsert
