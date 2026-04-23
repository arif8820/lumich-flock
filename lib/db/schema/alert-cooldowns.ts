import { pgTable, uuid, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const alertCooldowns = pgTable('alert_cooldowns', {
  id: uuid('id').primaryKey().defaultRandom(),
  alertType: text('alert_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  lastSentAt: timestamp('last_sent_at', { withTimezone: true }).notNull(),
}, (t) => [
  uniqueIndex('alert_cooldowns_unique').on(t.alertType, t.entityId),
])

export type AlertCooldown = typeof alertCooldowns.$inferSelect
export type NewAlertCooldown = typeof alertCooldowns.$inferInsert