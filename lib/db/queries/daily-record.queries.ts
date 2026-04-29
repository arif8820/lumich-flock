import { db } from '@/lib/db'
import { dailyRecords, inventoryMovements } from '@/lib/db/schema'
import { eq, and, desc, sum } from 'drizzle-orm'
import type { DailyRecord, NewDailyRecord, NewInventoryMovement } from '@/lib/db/schema'

export async function findDailyRecordById(id: string): Promise<DailyRecord | null> {
  const [record] = await db.select().from(dailyRecords).where(eq(dailyRecords.id, id)).limit(1)
  return record ?? null
}

export async function findDailyRecord(flockId: string, recordDate: Date): Promise<DailyRecord | null> {
  const [record] = await db
    .select()
    .from(dailyRecords)
    .where(and(eq(dailyRecords.flockId, flockId), eq(dailyRecords.recordDate, recordDate)))
    .limit(1)
  return record ?? null
}

export async function findRecentDailyRecords(flockId: string, limit: number): Promise<DailyRecord[]> {
  return db
    .select()
    .from(dailyRecords)
    .where(eq(dailyRecords.flockId, flockId))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
}

export async function getTotalDepletionByFlock(
  flockId: string
): Promise<{ deaths: number; culled: number }> {
  const [row] = await db
    .select({ totalDeaths: sum(dailyRecords.deaths), totalCulled: sum(dailyRecords.culled) })
    .from(dailyRecords)
    .where(eq(dailyRecords.flockId, flockId))
  return {
    deaths: Number(row?.totalDeaths ?? '0'),
    culled: Number(row?.totalCulled ?? '0'),
  }
}

export async function insertDailyRecordWithMovements(
  record: NewDailyRecord,
  movements: NewInventoryMovement[]
): Promise<DailyRecord> {
  return db.transaction(async (tx) => {
    const [inserted] = await tx.insert(dailyRecords).values(record).returning()
    if (movements.length > 0) {
      await tx.insert(inventoryMovements).values(movements)
    }
    return inserted!
  })
}
