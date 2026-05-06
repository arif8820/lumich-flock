import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const farmUsers = pgTable('farm_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  farmSchema: text('farm_schema').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type FarmUser = typeof farmUsers.$inferSelect
export type NewFarmUser = typeof farmUsers.$inferInsert
