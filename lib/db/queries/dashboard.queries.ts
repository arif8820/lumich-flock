import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { desc, isNull, and, sum, eq, inArray, SQL, sql, asc } from 'drizzle-orm'

export type DashboardRecord = {
  id: string
  flockId: string
  recordDate: string | Date
  deaths: number
  culled: number
  isLateInput: boolean
}

export async function getRecentDailyRecordsAcrossFlocks(farmSchema: string, limit: number, flockIds?: string[]): Promise<DashboardRecord[]> {
  const { dailyRecords, flocks } = getFarmSchema(farmSchema)
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
    .limit(limit) as any
}

export type DailyAggRow = {
  date: string
  totalEggs: number
  totalDeaths: number
}

export async function getDailyProductionAgg(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<DailyAggRow[]> {
  const { dailyRecords, flocks } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    sql`${dailyRecords.recordDate} >= ${since}`,
    sql`${dailyRecords.recordDate} <= ${until}`,
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const rows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
    date: r.date,
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

export async function getActiveFlockPopulations(farmSchema: string, flockIds?: string[]): Promise<FlockPopulationRow[]> {
  const { dailyRecords, flocks, flockDeliveries } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [isNull(flocks.retiredAt)]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(flocks.id, flockIds))
  const rows = await db
    .select({
      flockId: flocks.id,
      totalCount: sql<number>`COALESCE((SELECT SUM(${flockDeliveries.quantity}) FROM ${flockDeliveries} WHERE ${flockDeliveries.flockId} = ${flocks.id}), 0)`,
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

export async function getStockSummary(farmSchema: string): Promise<StockSummaryRow> {
  const { inventoryMovements, stockItems, stockCategories } = getFarmSchema(farmSchema)
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

export async function getHdpTrend(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<HdpPoint[]> {
  const { dailyRecords, dailyEggRecords, flocks, flockDeliveries } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    sql`${dailyRecords.recordDate} >= ${since}`,
    sql`${dailyRecords.recordDate} <= ${until}`,
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const eggRows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
      initialCount: sql<number>`COALESCE((SELECT SUM(${flockDeliveries.quantity}) FROM ${flockDeliveries} WHERE ${flockDeliveries.flockId} = ${flocks.id}), 0)`,
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
    date: r.date,
    hdp: totalPop > 0 ? Math.round((Number(r.totalEggs ?? 0) / totalPop) * 10000) / 100 : 0,
  }))
}

export type FcrPoint = { date: string; fcr: number }

export async function getFcrTrend(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<FcrPoint[]> {
  const { dailyRecords, dailyEggRecords, dailyFeedRecords, flocks } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    sql`${dailyRecords.recordDate} >= ${since}`,
    sql`${dailyRecords.recordDate} <= ${until}`,
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const feedRows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
    const eggKg = eggByDate.get(r.date) ?? 0
    return {
      date: r.date,
      fcr: eggKg > 0 ? Math.round((feedKg / eggKg) * 100) / 100 : 0,
    }
  })
}

export type FeedPerBirdPoint = { date: string; feedGram: number }

export async function getFeedPerBirdTrend(farmSchema: string, since: string, until: string, flockIds?: string[]): Promise<FeedPerBirdPoint[]> {
  const { dailyRecords, dailyFeedRecords, flocks, flockDeliveries } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    sql`${dailyRecords.recordDate} >= ${since}`,
    sql`${dailyRecords.recordDate} <= ${until}`,
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const feedRows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
      initialCount: sql<number>`COALESCE((SELECT SUM(${flockDeliveries.quantity}) FROM ${flockDeliveries} WHERE ${flockDeliveries.flockId} = ${flocks.id}), 0)`,
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
      date: r.date,
      feedGram: totalPop > 0 ? Math.round((feedKg * 1000) / totalPop) : 0,
    }
  })
}

export type ProductionBySkuRow = {
  date: string
  skuBreakdown: Record<string, number>
}

export async function getProductionBySkuTrend(
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ProductionBySkuRow[]> {
  const { dailyRecords, dailyEggRecords, flocks, stockItems, stockCategories } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    sql`${dailyRecords.recordDate} >= ${since}`,
    sql`${dailyRecords.recordDate} <= ${until}`,
    eq(stockCategories.name, 'Telur'),
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const rows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
    const date = r.date
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
  farmSchema: string,
  since: string,
  until: string,
  flockIds?: string[]
): Promise<ExtendedDashboardRecord[]> {
  const { dailyRecords, dailyEggRecords, dailyFeedRecords, flocks, stockItems, stockCategories } = getFarmSchema(farmSchema)
  const conditions: SQL[] = [
    isNull(flocks.retiredAt),
    sql`${dailyRecords.recordDate} >= ${since}`,
    sql`${dailyRecords.recordDate} <= ${until}`,
  ]
  if (flockIds && flockIds.length > 0) conditions.push(inArray(dailyRecords.flockId, flockIds))

  const baseRows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
      deaths: sum(dailyRecords.deaths),
      culled: sum(dailyRecords.culled),
      isLateInput: sql<boolean>`BOOL_OR(${dailyRecords.isLateInput})`,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .where(and(...conditions))
    .groupBy(dailyRecords.recordDate)
    .orderBy(desc(dailyRecords.recordDate))

  const dates = baseRows.map((r) => r.date)
  if (dates.length === 0) return []

  const eggConditions: SQL[] = [
    sql`${dailyRecords.recordDate}::text = ANY(${sql`ARRAY[${sql.join(dates.map((d) => sql`${d}`), sql`, `)}]`})`,
    eq(stockCategories.name, 'Telur'),
  ]
  if (flockIds && flockIds.length > 0) eggConditions.push(inArray(dailyRecords.flockId, flockIds))

  const eggRows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
      totalEggs: sum(dailyEggRecords.qtyButir),
    })
    .from(dailyEggRecords)
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .innerJoin(stockItems, eq(dailyEggRecords.stockItemId, stockItems.id))
    .innerJoin(stockCategories, eq(stockItems.categoryId, stockCategories.id))
    .where(and(...eggConditions))
    .groupBy(dailyRecords.recordDate)

  const feedConditions: SQL[] = [
    sql`${dailyRecords.recordDate}::text = ANY(${sql`ARRAY[${sql.join(dates.map((d) => sql`${d}`), sql`, `)}]`})`,
  ]
  if (flockIds && flockIds.length > 0) feedConditions.push(inArray(dailyRecords.flockId, flockIds))

  const feedRows = await db
    .select({
      date: sql<string>`${dailyRecords.recordDate}::text`,
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
    date: r.date,
    totalEggs: eggByDate.get(r.date) ?? 0,
    totalFeedKg: feedByDate.get(r.date) ?? 0,
    deaths: Number(r.deaths ?? 0),
    culled: Number(r.culled ?? 0),
    isLateInput: r.isLateInput ?? false,
  }))
}
