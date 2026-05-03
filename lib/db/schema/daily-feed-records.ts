import { pgTable, uuid, numeric, uniqueIndex } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'

export const dailyFeedRecords = pgTable('daily_feed_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  qtyUsed: numeric('qty_used', { precision: 8, scale: 2 }).notNull(),
}, (t) => [uniqueIndex('daily_feed_records_record_item_unique').on(t.dailyRecordId, t.stockItemId)])

export type DailyFeedRecord = typeof dailyFeedRecords.$inferSelect
export type NewDailyFeedRecord = typeof dailyFeedRecords.$inferInsert
