import { db } from '@/lib/db'
import {
  dailyRecords,
  dailyEggRecords,
  dailyFeedRecords,
  flocks,
  stockItems,
  stockCategories,
  inventoryMovements,
} from '@/lib/db/schema'
import { desc, isNull, gte, lte, and, sum, eq, inArray, SQL, sql, asc } from 'drizzle-orm'
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

export async function getDailyProductionAgg(since: string, until: string, flockIds?: string[]): Promise<DailyAggRow[]> {
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    gte(dailyRecords.recordDate, since),
    lte(dailyRecords.recordDate, until),
  ]
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
    .orderBy(asc(dailyRecords.recordDate))

  // totalEggs intentionally not computed here — this query feeds the depletion chart only.
  // For egg production data use getExtendedDailyRecords or getProductionBySkuTrend.
  return rows.map((r) => ({
    date: r.date as string,
    totalEggs: 0,
    totalDeaths: Number(r.totalDeaths ?? 0),
  }))
}

export type FlockPopulationRow = {
  flockId: string
  totalCount: number
  totalDeaths: number
  totalCulled: number
}

export async function getActiveFlockPopulations(flockIds?: string[]): Promise<FlockPopulationRow[]> {
  const conditions: SQL[] = [isNull(flocks.retiredAt)]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(flocks.id, flockIds))
  const rows = await db
    .select({
      flockId: flocks.id,
      totalCount: sql<number>`COALESCE((SELECT SUM(fd.quantity) FROM flock_deliveries fd WHERE fd.flock_id = ${flocks.id}), 0)`,
      totalDeaths: sum(dailyRecords.deaths),
      totalCulled: sum(dailyRecords.culled),
    })
    .from(flocks)
    .leftJoin(dailyRecords, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(flocks.id)

  return rows.map((r) => ({
    flockId: r.flockId,
    totalCount: Number(r.totalCount),
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
      balance: sum(sql<number>`CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END`),
    })
    .from(inventoryMovements)
    .innerJoin(stockItems, eq(inventoryMovements.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(eq(stockCategories.name, 'Telur'))

  const totalEggs = Number(rows[0]?.balance ?? 0)
  return { totalEggs }
}

export type HdpPoint = { date: string; hdp: number }

export async function getHdpTrend(since: string, until: string, flockIds?: string[]): Promise<HdpPoint[]> {
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    gte(dailyRecords.recordDate, since),
    lte(dailyRecords.recordDate, until),
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const eggRows = await db
    .select({
      date: dailyRecords.recordDate,
      totalEggs: sum(dailyEggRecords.qtyButir),
    })
    .from(dailyEggRecords)
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(asc(dailyRecords.recordDate))

  // Population snapshot: cumulative active birds as of now (not per-date).
  // Acceptable approximation for dashboard trend display; use /laporan for precision.
  const popRows = await db
    .select({
      flockId: flocks.id,
      initialCount: sql<number>`COALESCE((SELECT SUM(fd.quantity) FROM flock_deliveries fd WHERE fd.flock_id = ${flocks.id}), 0)`,
      totalDeaths: sum(dailyRecords.deaths),
      totalCulled: sum(dailyRecords.culled),
    })
    .from(flocks)
    .leftJoin(dailyRecords, eq(dailyRecords.flockId, flocks.id))
    .where(isNull(flocks.retiredAt))
    .groupBy(flocks.id)

  const totalPop = popRows.reduce(
    (acc, r) => acc + Math.max(0, Number(r.initialCount) - Number(r.totalDeaths ?? 0) - Number(r.totalCulled ?? 0)),
    0
  )

  return eggRows.map((r) => ({
    date: r.date as string,
    hdp: totalPop > 0 ? Math.round((Number(r.totalEggs ?? 0) / totalPop) * 10000) / 100 : 0,
  }))
}

export type FcrPoint = { date: string; fcr: number }

export async function getFcrTrend(since: string, until: string, flockIds?: string[]): Promise<FcrPoint[]> {
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    gte(dailyRecords.recordDate, since),
    lte(dailyRecords.recordDate, until),
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const feedRows = await db
    .select({
      date: dailyRecords.recordDate,
      totalFeedKg: sum(dailyFeedRecords.qtyUsed),
    })
    .from(dailyFeedRecords)
    .innerJoin(dailyRecords, eq(dailyFeedRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(asc(dailyRecords.recordDate))

  const eggKgRows = await db
    .select({
      date: dailyRecords.recordDate,
      totalEggKg: sum(dailyEggRecords.qtyKg),
    })
    .from(dailyEggRecords)
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(asc(dailyRecords.recordDate))

  const eggByDate = new Map(eggKgRows.map((r) => [r.date, Number(r.totalEggKg ?? 0)]))

  return feedRows.map((r) => {
    const feedKg = Number(r.totalFeedKg ?? 0)
    const eggKg = eggByDate.get(r.date as string) ?? 0
    return {
      date: r.date as string,
      fcr: eggKg > 0 ? Math.round((feedKg / eggKg) * 100) / 100 : 0,
    }
  })
}

export type FeedPerBirdPoint = { date: string; feedGram: number }

export async function getFeedPerBirdTrend(since: string, until: string, flockIds?: string[]): Promise<FeedPerBirdPoint[]> {
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    gte(dailyRecords.recordDate, since),
    lte(dailyRecords.recordDate, until),
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const feedRows = await db
    .select({
      date: dailyRecords.recordDate,
      totalFeedKg: sum(dailyFeedRecords.qtyUsed),
    })
    .from(dailyFeedRecords)
    .innerJoin(dailyRecords, eq(dailyFeedRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(asc(dailyRecords.recordDate))

  // Population snapshot: cumulative active birds as of now (not per-date).
  // Acceptable approximation for dashboard trend display; use /laporan for precision.
  const popRows = await db
    .select({
      flockId: flocks.id,
      initialCount: sql<number>`COALESCE((SELECT SUM(fd.quantity) FROM flock_deliveries fd WHERE fd.flock_id = ${flocks.id}), 0)`,
      totalDeaths: sum(dailyRecords.deaths),
      totalCulled: sum(dailyRecords.culled),
    })
    .from(flocks)
    .leftJoin(dailyRecords, eq(dailyRecords.flockId, flocks.id))
    .where(isNull(flocks.retiredAt))
    .groupBy(flocks.id)

  const totalPop = popRows.reduce(
    (acc, r) => acc + Math.max(0, Number(r.initialCount) - Number(r.totalDeaths ?? 0) - Number(r.totalCulled ?? 0)),
    0
  )

  return feedRows.map((r) => {
    const feedKg = Number(r.totalFeedKg ?? 0)
    return {
      date: r.date as string,
      feedGram: totalPop > 0 ? Math.round((feedKg * 1000) / totalPop) : 0,
    }
  })
}

export type ProductionBySkuRow = {
  date: string
  skuBreakdown: Record<string, number>
}

export async function getProductionBySkuTrend(
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ProductionBySkuRow[]> {
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    gte(dailyRecords.recordDate, since),
    lte(dailyRecords.recordDate, until),
    eq(stockCategories.name, 'Telur'),
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const rows = await db
    .select({
      date: dailyRecords.recordDate,
      skuName: stockItems.name,
      totalButir: sum(dailyEggRecords.qtyButir),
    })
    .from(dailyEggRecords)
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .innerJoin(stockItems, eq(dailyEggRecords.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate, stockItems.name)
    .orderBy(asc(dailyRecords.recordDate), asc(stockItems.name))

  // SKU name is used as the chart data key. Safe: stock_items has unique(category_id, name).
  const byDate = new Map<string, Record<string, number>>()
  for (const r of rows) {
    const date = r.date as string
    if (!byDate.has(date)) byDate.set(date, {})
    byDate.get(date)![r.skuName] = Number(r.totalButir ?? 0)
  }

  return Array.from(byDate.entries()).map(([date, skuBreakdown]) => ({ date, skuBreakdown }))
}

export type ExtendedDashboardRecord = {
  date: string
  totalEggs: number
  totalFeedKg: number
  deaths: number
  culled: number
  isLateInput: boolean
}

export async function getExtendedDailyRecords(
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ExtendedDashboardRecord[]> {
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    gte(dailyRecords.recordDate, since),
    lte(dailyRecords.recordDate, until),
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const baseRows = await db
    .select({
      date: dailyRecords.recordDate,
      deaths: sum(dailyRecords.deaths),
      culled: sum(dailyRecords.culled),
      isLateInput: sql<boolean>`BOOL_OR(${dailyRecords.isLateInput})`,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(desc(dailyRecords.recordDate))

  const dates = baseRows.map((r) => r.date as string)
  if (dates.length === 0) return []

  const eggConditions: SQL[] = [
    inArray(dailyRecords.recordDate, dates),
    eq(stockCategories.name, 'Telur'),
  ]
  if (flockIds && flockIds.length > 0) eggConditions.push(inArray(dailyRecords.flockId, flockIds))

  const eggRows = await db
    .select({
      date: dailyRecords.recordDate,
      totalEggs: sum(dailyEggRecords.qtyButir),
    })
    .from(dailyEggRecords)
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .innerJoin(stockItems, eq(dailyEggRecords.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(and(...eggConditions))
    .groupBy(dailyRecords.recordDate)

  const feedConditions: SQL[] = [inArray(dailyRecords.recordDate, dates)]
  if (flockIds && flockIds.length > 0) feedConditions.push(inArray(dailyRecords.flockId, flockIds))

  const feedRows = await db
    .select({
      date: dailyRecords.recordDate,
      totalFeedKg: sum(dailyFeedRecords.qtyUsed),
    })
    .from(dailyFeedRecords)
    .innerJoin(dailyRecords, eq(dailyFeedRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...feedConditions))
    .groupBy(dailyRecords.recordDate)

  const eggByDate = new Map(eggRows.map((r) => [r.date, Number(r.totalEggs ?? 0)]))
  const feedByDate = new Map(feedRows.map((r) => [r.date, Number(r.totalFeedKg ?? 0)]))

  return baseRows.map((r) => ({
    date: r.date as string,
    totalEggs: eggByDate.get(r.date as string) ?? 0,
    totalFeedKg: feedByDate.get(r.date as string) ?? 0,
    deaths: Number(r.deaths ?? 0),
    culled: Number(r.culled ?? 0),
    isLateInput: r.isLateInput ?? false,
  }))
}
