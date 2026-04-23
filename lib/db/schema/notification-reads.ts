import { pgTable, uuid, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { notifications } from './notifications'
import { users } from './users'

export const notificationReads = pgTable('notification_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  notificationId: uuid('notification_id').notNull().references(() => notifications.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  readAt: timestamp('read_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('notification_reads_unique').on(t.notificationId, t.userId),
])

export type NotificationRead = typeof notificationReads.$inferSelect
export type NewNotificationRead = typeof notificationReads.$inferInsert