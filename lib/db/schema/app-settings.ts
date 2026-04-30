import { pgTable, text, uuid, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey().notNull(),
  value: text('value').notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()).notNull(),
})

export type AppSetting = typeof appSettings.$inferSelect
export type NewAppSetting = typeof appSettings.$inferInsert
