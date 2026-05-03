import { db } from '@/lib/db'
import { dailyRecords, flocks, inventoryMovements } from '@/lib/db/schema'
import { desc, isNull, gte, and, sum, eq, inArray, SQL } from 'drizzle-orm'
import type { DailyRecord } from '@/lib/db/schema'

export type DashboardRecord = Pick<
  DailyRecord,
  'id' | 'flockId' | 'recordDate' | 'deaths' | 'culled' | 'eggsGradeA' | 'eggsGradeB' | 'feedKg' | 'isLateInput'
>

export async function getRecentDailyRecordsAcrossFlocks(limit: number, flockIds?: string[]): Promise<DashboardRecord[]> {
  const conditions: SQL[] = [isNull(flocks.retiredAt)]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))
  return db
    .select({
      id: dailyRecords.id,
      flockId: dailyRecords.flockId,
      recordDate: dailyRecords.recordDate,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
      eggsGradeA: dailyRecords.eggsGradeA,
      eggsGradeB: dailyRecords.eggsGradeB,
      feedKg: dailyRecords.feedKg,
      isLateInput: dailyRecords.isLateInput,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
}

export type DailyAggRow = {
  date: Date
  totalEggsA: number
  totalEggsB: number
  totalDeaths: number
  totalFeedKg: number
}

export async function getDailyProductionAgg(days: number, flockIds?: string[]): Promise<DailyAggRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const conditions: SQL[] = [isNull(flocks.retiredAt), gte(dailyRecords.recordDate, since)]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const rows = await db
    .select({
      date: dailyRecords.recordDate,
      totalEggsA: sum(dailyRecords.eggsGradeA),
      totalEggsB: sum(dailyRecords.eggsGradeB),
      totalDeaths: sum(dailyRecords.deaths),
      totalFeedKg: sum(dailyRecords.feedKg),
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(desc(dailyRecords.recordDate))
    .limit(days)

  return rows.map((r) => ({
    date: r.date,
    totalEggsA: Number(r.totalEggsA ?? 0),
    totalEggsB: Number(r.totalEggsB ?? 0),
    totalDeaths: Number(r.totalDeaths ?? 0),
    totalFeedKg: Number(r.totalFeedKg ?? 0),
  }))
}

export type FlockPopulationRow = {
  flockId: string
  initialCount: number
  totalDeaths: number
  totalCulled: number
}

export async function getActiveFlockPopulations(flockIds?: string[]): Promise<FlockPopulationRow[]> {
  const conditions: SQL[] = [isNull(flocks.retiredAt)]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(flocks.id, flockIds))
  const rows = await db
    .select({
      flockId: flocks.id,
      initialCount: flocks.initialCount,
      totalDeaths: sum(dailyRecords.deaths),
      totalCulled: sum(dailyRecords.culled),
    })
    .from(flocks)
    .leftJoin(dailyRecords, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(flocks.id, flocks.initialCount)

  return rows.map((r) => ({
    flockId: r.flockId,
    initialCount: r.initialCount,
    totalDeaths: Number(r.totalDeaths ?? 0),
    totalCulled: Number(r.totalCulled ?? 0),
  }))
}

export type StockSummaryRow = {
  totalGradeA: number
  totalGradeB: number
}

export async function getStockSummary(): Promise<StockSummaryRow> {
  const rows = await db
    .select({
      type: inventoryMovements.movementType,
      grade: inventoryMovements.grade,
      qty: sum(inventoryMovements.quantity),
    })
    .from(inventoryMovements)
    .groupBy(inventoryMovements.movementType, inventoryMovements.grade)

  let gradeA = 0
  let gradeB = 0
  for (const r of rows) {
    const qty = Number(r.qty ?? 0)
    const sign = r.type === 'in' ? 1 : -1
    if (r.grade === 'A') gradeA += sign * qty
    if (r.grade === 'B') gradeB += sign * qty
  }
  return { totalGradeA: Math.max(0, gradeA), totalGradeB: Math.max(0, gradeB) }
}
