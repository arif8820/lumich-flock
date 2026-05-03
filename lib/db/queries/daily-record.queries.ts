import { db } from '@/lib/db'
import { dailyRecords, inventoryMovements, flocks, coops } from '@/lib/db/schema'
import { eq, and, desc, sum, gte, lte, asc, inArray } from 'drizzle-orm'
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

export type DailyRecordWithFlock = DailyRecord & { flockName: string; coopName: string }

export async function findRecentDailyRecordsMultiFlocks(
  flockIds: string[],
  limit: number,
): Promise<DailyRecordWithFlock[]> {
  if (flockIds.length === 0) return []
  return db
    .select({
      id: dailyRecords.id,
      flockId: dailyRecords.flockId,
      recordDate: dailyRecords.recordDate,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
      eggsGradeA: dailyRecords.eggsGradeA,
      eggsGradeB: dailyRecords.eggsGradeB,
      eggsCracked: dailyRecords.eggsCracked,
      eggsAbnormal: dailyRecords.eggsAbnormal,
      avgWeightKg: dailyRecords.avgWeightKg,
      feedKg: dailyRecords.feedKg,
      isLateInput: dailyRecords.isLateInput,
      isImported: dailyRecords.isImported,
      importedBy: dailyRecords.importedBy,
      createdBy: dailyRecords.createdBy,
      updatedBy: dailyRecords.updatedBy,
      createdAt: dailyRecords.createdAt,
      updatedAt: dailyRecords.updatedAt,
      flockName: flocks.name,
      coopName: coops.name,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(flocks.id, dailyRecords.flockId))
    .innerJoin(coops, eq(coops.id, flocks.coopId))
    .where(inArray(dailyRecords.flockId, flockIds))
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

export async function getCumulativeDepletionByFlockUpTo(
  flockId: string,
  upToDate: Date
): Promise<{ deaths: number; culled: number }> {
  const [row] = await db
    .select({ totalDeaths: sum(dailyRecords.deaths), totalCulled: sum(dailyRecords.culled) })
    .from(dailyRecords)
    .where(and(eq(dailyRecords.flockId, flockId), lte(dailyRecords.recordDate, upToDate)))
  return {
    deaths: Number(row?.totalDeaths ?? '0'),
    culled: Number(row?.totalCulled ?? '0'),
  }
}

export type ProductionReportRow = {
  recordDate: Date
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  flockInitialCount: number
  deaths: number
  culled: number
  eggsGradeA: number
  eggsGradeB: number
  feedKg: string | null
}

export async function getProductionReport(
  from: Date,
  to: Date
): Promise<ProductionReportRow[]> {
  return db
    .select({
      recordDate: dailyRecords.recordDate,
      coopId: coops.id,
      coopName: coops.name,
      flockId: flocks.id,
      flockName: flocks.name,
      flockInitialCount: flocks.initialCount,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
      eggsGradeA: dailyRecords.eggsGradeA,
      eggsGradeB: dailyRecords.eggsGradeB,
      feedKg: dailyRecords.feedKg,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(flocks.id, dailyRecords.flockId))
    .innerJoin(coops, eq(coops.id, flocks.coopId))
    .where(and(gte(dailyRecords.recordDate, from), lte(dailyRecords.recordDate, to)))
    .orderBy(asc(coops.name), asc(dailyRecords.recordDate))
}
