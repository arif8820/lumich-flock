import { pgTable, uuid, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { dailyEggBundles } from './daily-egg-bundles'
import { dailyEggRecords } from './daily-egg-records'
import { users } from './users'

export const bundleContributions = pgTable('bundle_contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  bundleId: uuid('bundle_id').notNull().references(() => dailyEggBundles.id, { onDelete: 'cascade' }),
  dailyEggRecordId: uuid('daily_egg_record_id').notNull().references(() => dailyEggRecords.id),
  qtyButir: integer('qty_butir').notNull(),
  qtyKg: numeric('qty_kg', { precision: 8, scale: 2 }).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BundleContribution = typeof bundleContributions.$inferSelect
export type NewBundleContribution = typeof bundleContributions.$inferInsert
