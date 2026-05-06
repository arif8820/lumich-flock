import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { farms } from './farms'

export const farmUsers = pgTable('farm_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  farmSchema: text('farm_schema').notNull().references(() => farms.schemaName),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type FarmUser = typeof farmUsers.$inferSelect
export type NewFarmUser = typeof farmUsers.$inferInsert
