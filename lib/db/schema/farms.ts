import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const farms = pgTable('farms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  schemaName: text('schema_name').unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Farm = typeof farms.$inferSelect
export type NewFarm = typeof farms.$inferInsert
