import { pgTable, uuid, date, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { flocks } from './flocks'
import { users } from './users'

export const flockDeliveries = pgTable('flock_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  flockId: uuid('flock_id').notNull().references(() => flocks.id),
  deliveryDate: date('delivery_date', { mode: 'date' }).notNull(),
  quantity: integer('quantity').notNull(),
  ageAtArrivalDays: integer('age_at_arrival_days'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type FlockDelivery = typeof flockDeliveries.$inferSelect
export type NewFlockDelivery = typeof flockDeliveries.$inferInsert
