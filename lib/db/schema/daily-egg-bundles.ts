import { integer, numeric, pgTable, timestamp, uuid, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { dailyEggRecords } from './daily-egg-records'

export const dailyEggBundles = pgTable(
  'daily_egg_bundles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dailyEggRecordId: uuid('daily_egg_record_id')
      .notNull()
      .references(() => dailyEggRecords.id, { onDelete: 'cascade' }),
    bundleIndex: integer('bundle_index').notNull(),
    trayCount: integer('tray_count').notNull(),
    topTrayCount: integer('top_tray_count').notNull(),
    qtyButir: integer('qty_butir').notNull(),
    qtyKg: numeric('qty_kg', { precision: 8, scale: 2 }).notNull(),
    bundleCode: varchar('bundle_code', { length: 12 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('daily_egg_bundles_record_index_unique').on(t.dailyEggRecordId, t.bundleIndex),
  ]
)

export type DailyEggBundle = typeof dailyEggBundles.$inferSelect
export type NewDailyEggBundle = typeof dailyEggBundles.$inferInsert
