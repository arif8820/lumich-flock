import { pgTable, uuid, numeric, uniqueIndex } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'

export const dailyVaccineRecords = pgTable('daily_vaccine_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  qtyUsed: numeric('qty_used', { precision: 8, scale: 2 }).notNull(),
}, (t) => [uniqueIndex('daily_vaccine_records_record_item_unique').on(t.dailyRecordId, t.stockItemId)])

export type DailyVaccineRecord = typeof dailyVaccineRecords.$inferSelect
export type NewDailyVaccineRecord = typeof dailyVaccineRecords.$inferInsert
