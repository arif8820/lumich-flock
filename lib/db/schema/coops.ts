import { pgTable, uuid, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const coopStatusEnum = pgEnum('coop_status', ['active', 'inactive'])

export const coops = pgTable('coops', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  capacity: integer('capacity'),
  status: coopStatusEnum('status').default('active').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type Coop = typeof coops.$inferSelect
export type NewCoop = typeof coops.$inferInsert
