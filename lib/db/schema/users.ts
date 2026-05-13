import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { roles } from './roles'

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  roleId: uuid('role_id').references(() => roles.id).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
