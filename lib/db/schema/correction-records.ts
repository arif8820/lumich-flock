import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const correctionEntityTypeEnum = pgEnum('correction_entity_type', ['daily_records', 'inventory_movements', 'sales_orders'])

export const correctionRecords = pgTable('correction_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: correctionEntityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  fieldName: text('field_name').notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  reason: text('reason').notNull(),
  correctedBy: uuid('corrected_by').notNull().references(() => users.id),
  correctedAt: timestamp('corrected_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type CorrectionRecord = typeof correctionRecords.$inferSelect
export type NewCorrectionRecord = typeof correctionRecords.$inferInsert