import { pgTable, uuid, integer, numeric, uniqueIndex, timestamp } from 'drizzle-orm/pg-core'
import { dailyRecords } from './daily-records'
import { stockItems } from './stock-items'

export const dailyEggRecords = pgTable('daily_egg_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  dailyRecordId: uuid('daily_record_id').notNull().references(() => dailyRecords.id, { onDelete: 'cascade' }),
  stockItemId: uuid('stock_item_id').notNull().references(() => stockItems.id),
  qtyButir: integer('qty_butir').notNull().default(0),
  qtyKg: numeric('qty_kg', { precision: 8, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
}, (t) =>[uniqueIndex('daily_egg_records_record_item_unique').on(t.dailyRecordId, t.stockItemId)])

export type DailyEggRecord = typeof dailyEggRecords.$inferSelect
export type NewDailyEggRecord = typeof dailyEggRecords.$inferInsert
