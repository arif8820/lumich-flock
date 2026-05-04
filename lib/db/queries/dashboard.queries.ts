import { db } from '@/lib/db'
import { dailyRecords, flocks, dailyEggRecords, stockItems, stockCategories } from '@/lib/db/schema'
import { desc, isNull, gte, and, sum, eq, inArray, SQL } from 'drizzle-orm'
import type { DailyRecord } from '@/lib/db/schema'

export type DashboardRecord = Pick<
  DailyRecord,
  'id' | 'flockId' | 'recordDate' | 'deaths' | 'culled' | 'isLateInput'
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
      isLateInput: dailyRecords.isLateInput,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
}

export type DailyAggRow = {
  date: string
  totalEggs: number
  totalDeaths: number
}

export async function getDailyProductionAgg(days: number, flockIds?: string[]): Promise<DailyAggRow[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceStr = since.toISOString().split('T')[0]!

  const conditions: SQL[] = [isNull(flocks.retiredAt), gte(dailyRecords.recordDate, sinceStr)]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const rows = await db
    .select({
      date: dailyRecords.recordDate,
      totalDeaths: sum(dailyRecords.deaths),
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(desc(dailyRecords.recordDate))
    .limit(days)

  // Egg totals require joining daily_egg_records — return 0 for now, laporan has full data
  return rows.map((r) => ({
    date: r.date as string,
    totalEggs: 0,
    totalDeaths: Number(r.totalDeaths ?? 0),
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
  totalEggs: number
}

export async function getStockSummary(): Promise<StockSummaryRow> {
  const rows = await db
    .select({
      stockItemId: dailyEggRecords.stockItemId,
      categoryName: stockCategories.name,
      totalButir: sum(dailyEggRecords.qtyButir),
    })
    .from(dailyEggRecords)
    .innerJoin(stockItems, eq(dailyEggRecords.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(eq(stockCategories.name, 'Telur'))
    .groupBy(dailyEggRecords.stockItemId, stockCategories.name)

  const totalEggs = rows.reduce((s, r) => s + Number(r.totalButir ?? 0), 0)
  return { totalEggs }
}
