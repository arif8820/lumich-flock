import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const notificationTypeEnum = pgEnum('notification_type', ['production_alert', 'overdue_invoice', 'stock_warning', 'phase_change', 'other'])
export const notificationTargetRoleEnum = pgEnum('notification_target_role', ['operator', 'supervisor', 'admin', 'all'])

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  targetRole: notificationTargetRoleEnum('target_role').notNull(),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: uuid('related_entity_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert