import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique().notNull(),
  displayName: text('display_name').notNull(),
  isSystem: boolean('is_system').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by'),
})

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
