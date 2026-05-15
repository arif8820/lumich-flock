import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, sum, asc, inArray, sql, max } from 'drizzle-orm'
import { DailyEggBundle, NewDailyEggBundle } from '@/lib/db/schema'

export type DailySubRecords = {
  eggRecords: { stockItemId: string; qtyButir: number; qtyKg: number }[]
  feedRecords: { stockItemId: string; qtyUsed: number }[]
  vaccineRecords: { stockItemId: string; qtyUsed: number }[]
}

export async function findDailyRecordById(farmSchema: string, id: string) {
  const { dailyRecords } = getFarmSchema(farmSchema)
  const [record] = await db.select().from(dailyRecords).where(eq(dailyRecords.id, id)).limit(1)
  return record ?? null
}

export async function findDailySubRecordsByRecordId(farmSchema: string, recordId: string): Promise<DailySubRecords> {
  const { dailyEggRecords, dailyFeedRecords, dailyVaccineRecords } = getFarmSchema(farmSchema)
  const [eggs, feeds, vaccines] = await Promise.all([
    db.select({ stockItemId: dailyEggRecords.stockItemId, qtyButir: dailyEggRecords.qtyButir, qtyKg: dailyEggRecords.qtyKg })
      .from(dailyEggRecords).where(eq(dailyEggRecords.dailyRecordId, recordId)),
    db.select({ stockItemId: dailyFeedRecords.stockItemId, qtyUsed: dailyFeedRecords.qtyUsed })
      .from(dailyFeedRecords).where(eq(dailyFeedRecords.dailyRecordId, recordId)),
    db.select({ stockItemId: dailyVaccineRecords.stockItemId, qtyUsed: dailyVaccineRecords.qtyUsed })
      .from(dailyVaccineRecords).where(eq(dailyVaccineRecords.dailyRecordId, recordId)),
  ])
  return {
    eggRecords: eggs.map((e) => ({ stockItemId: e.stockItemId, qtyButir: e.qtyButir, qtyKg: Number(e.qtyKg) })),
    feedRecords: feeds.map((f) => ({ stockItemId: f.stockItemId, qtyUsed: Number(f.qtyUsed) })),
    vaccineRecords: vaccines.map((v) => ({ stockItemId: v.stockItemId, qtyUsed: Number(v.qtyUsed) })),
  }
}

export async function findDailyRecord(farmSchema: string, flockId: string, recordDate: string) {
  const { dailyRecords } = getFarmSchema(farmSchema)
  const [record] = await db
    .select()
    .from(dailyRecords)
    .where(and(eq(dailyRecords.flockId, flockId), sql`${dailyRecords.recordDate} = ${recordDate}`))
    .limit(1)
  return record ?? null
}

export async function findRecentDailyRecords(farmSchema: string, flockId: string, limit: number) {
  const { dailyRecords } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(dailyRecords)
    .where(eq(dailyRecords.flockId, flockId))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
}

export type DailyRecordWithFlock = {
  id: string
  flockId: string
  recordDate: string | Date
  deaths: number
  culled: number
  eggsCracked: number
  eggsAbnormal: number
  notes: string | null
  isLateInput: boolean
  isImported: boolean
  importedBy: string | null
  createdBy: string | null
  createdAt: Date
  flockName: string
  coopName: string
  coopId: string
  totalEggsButir: number
  totalFeedKg: number
  totalVaccineQty: number
}

export async function findRecentDailyRecordsMultiFlocks(
  farmSchema: string,
  flockIds: string[],
  limit: number,
): Promise<DailyRecordWithFlock[]> {
  if (flockIds.length === 0) return []
  const { dailyRecords, dailyEggRecords, dailyFeedRecords, dailyVaccineRecords, flocks, coops } = getFarmSchema(farmSchema)
  const rows = await db
    .select({
      id: dailyRecords.id,
      flockId: dailyRecords.flockId,
      recordDate: dailyRecords.recordDate,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
      eggsCracked: dailyRecords.eggsCracked,
      eggsAbnormal: dailyRecords.eggsAbnormal,
      notes: dailyRecords.notes,
      isLateInput: dailyRecords.isLateInput,
      isImported: dailyRecords.isImported,
      importedBy: dailyRecords.importedBy,
      createdBy: dailyRecords.createdBy,
      createdAt: dailyRecords.createdAt,
      flockName: flocks.name,
      coopName: coops.name,
      coopId: coops.id,
      totalEggsButir: sql<number>`COALESCE((SELECT SUM(${dailyEggRecords.qtyButir}) FROM ${dailyEggRecords} WHERE ${dailyEggRecords.dailyRecordId} = ${dailyRecords.id}), 0)`,
      totalFeedKg: sql<number>`COALESCE((SELECT SUM(${dailyFeedRecords.qtyUsed}) FROM ${dailyFeedRecords} WHERE ${dailyFeedRecords.dailyRecordId} = ${dailyRecords.id}), 0)`,
      totalVaccineQty: sql<number>`COALESCE((SELECT SUM(${dailyVaccineRecords.qtyUsed}) FROM ${dailyVaccineRecords} WHERE ${dailyVaccineRecords.dailyRecordId} = ${dailyRecords.id}), 0)`,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(flocks.id, dailyRecords.flockId))
    .innerJoin(coops, eq(coops.id, flocks.coopId))
    .where(inArray(dailyRecords.flockId, flockIds))
    .orderBy(desc(dailyRecords.recordDate))
    .limit(limit)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map(r => ({ ...r, totalEggsButir: Number(r.totalEggsButir), totalFeedKg: Number(r.totalFeedKg), totalVaccineQty: Number(r.totalVaccineQty) })) as any
}

export async function getTotalDepletionByFlock(
  farmSchema: string,
  flockId: string
): Promise<{ deaths: number; culled: number }> {
  const { dailyRecords } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({ totalDeaths: sum(dailyRecords.deaths), totalCulled: sum(dailyRecords.culled) })
    .from(dailyRecords)
    .where(eq(dailyRecords.flockId, flockId))
  return {
    deaths: Number(row?.totalDeaths ?? '0'),
    culled: Number(row?.totalCulled ?? '0'),
  }
}

export async function getCumulativeDepletionByFlockUpTo(
  farmSchema: string,
  flockId: string,
  upToDate: string
): Promise<{ deaths: number; culled: number }> {
  const { dailyRecords } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({ totalDeaths: sum(dailyRecords.deaths), totalCulled: sum(dailyRecords.culled) })
    .from(dailyRecords)
    .where(and(eq(dailyRecords.flockId, flockId), sql`${dailyRecords.recordDate} <= ${upToDate}`))
  return {
    deaths: Number(row?.totalDeaths ?? '0'),
    culled: Number(row?.totalCulled ?? '0'),
  }
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function upsertDailyRecordTx(farmSchema: string, input: any) {
  const {
    dailyRecords,
    dailyEggRecords,
    dailyFeedRecords,
    dailyVaccineRecords,
    inventoryMovements,
  } = getFarmSchema(farmSchema)

  // bundleStockItemIds: egg records for these items are managed by bundle flow, skip delete
  const bundleStockItemIds: string[] = input.bundleStockItemIds ?? []

  return db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(dailyRecords)
      .values(input.record)
      .onConflictDoUpdate({
        target: [dailyRecords.flockId, dailyRecords.recordDate],
        set: {
          deaths: input.record.deaths,
          culled: input.record.culled,
          eggsCracked: input.record.eggsCracked,
          eggsAbnormal: input.record.eggsAbnormal,
          notes: input.record.notes,
        },
      })
      .returning()
    const recordId = inserted!.id

    // Delete only non-bundle egg records; bundle items are managed separately via saveSingleBundle
    if (bundleStockItemIds.length > 0) {
      await tx.delete(dailyEggRecords).where(
        and(
          eq(dailyEggRecords.dailyRecordId, recordId),
          sql`${dailyEggRecords.stockItemId} NOT IN (${sql.join(bundleStockItemIds.map((id) => sql`${id}::uuid`), sql`, `)})`
        )
      )
    } else {
      await tx.delete(dailyEggRecords).where(eq(dailyEggRecords.dailyRecordId, recordId))
    }
    await tx.delete(dailyFeedRecords).where(eq(dailyFeedRecords.dailyRecordId, recordId))
    await tx.delete(dailyVaccineRecords).where(eq(dailyVaccineRecords.dailyRecordId, recordId))

    // Delete old movements from this record (by sourceId reference)
    await tx
      .delete(inventoryMovements)
      .where(and(
        eq(inventoryMovements.sourceId, recordId),
        inArray(inventoryMovements.sourceType, ['daily_egg_records', 'daily_feed_records', 'daily_vaccine_records'])
      ))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eggEntriesWithId = input.eggEntries.map((e: any) => ({ ...e, dailyRecordId: recordId }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const feedEntriesWithId = input.feedEntries.map((e: any) => ({ ...e, dailyRecordId: recordId }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vaccineEntriesWithId = input.vaccineEntries.map((e: any) => ({ ...e, dailyRecordId: recordId }))

    if (eggEntriesWithId.length > 0) await tx.insert(dailyEggRecords).values(eggEntriesWithId)
    if (feedEntriesWithId.length > 0) await tx.insert(dailyFeedRecords).values(feedEntriesWithId)
    if (vaccineEntriesWithId.length > 0) await tx.insert(dailyVaccineRecords).values(vaccineEntriesWithId)

    const allMovements = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...input.eggMovements.map((m: any) => ({ ...m, sourceId: recordId, sourceType: 'daily_egg_records' as const })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...input.feedMovements.map((m: any) => ({ ...m, sourceId: recordId, sourceType: 'daily_feed_records' as const })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...input.vaccineMovements.map((m: any) => ({ ...m, sourceId: recordId, sourceType: 'daily_vaccine_records' as const })),
    ]
    if (allMovements.length > 0) await tx.insert(inventoryMovements).values(allMovements)

    return inserted!
  })
}

export type ProductionReportRow = {
  recordDate: string | Date
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  flockTotalCount: number
  deaths: number
  culled: number
  totalEggsButir: number
}

export async function getProductionReport(
  farmSchema: string,
  from: string,
  to: string,
  coopId?: string
): Promise<ProductionReportRow[]> {
  const { dailyRecords, flocks, coops, flockDeliveries, dailyEggRecords } = getFarmSchema(farmSchema)
  const dateFilter = and(
    sql`${dailyRecords.recordDate} >= ${from}`,
    sql`${dailyRecords.recordDate} <= ${to}`,
    coopId ? eq(coops.id, coopId) : undefined
  )
  const rows = await db
    .select({
      recordDate: dailyRecords.recordDate,
      coopId: coops.id,
      coopName: coops.name,
      flockId: flocks.id,
      flockName: flocks.name,
      flockTotalCount: sql<number>`COALESCE((SELECT SUM(${flockDeliveries.quantity}) FROM ${flockDeliveries} WHERE ${flockDeliveries.flockId} = ${flocks.id}), 0)`,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
      totalEggsButir: sql<number>`COALESCE((SELECT SUM(${dailyEggRecords.qtyButir}) FROM ${dailyEggRecords} WHERE ${dailyEggRecords.dailyRecordId} = ${dailyRecords.id}), 0)`,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(flocks.id, dailyRecords.flockId))
    .innerJoin(coops, eq(coops.id, flocks.coopId))
    .where(dateFilter)
    .orderBy(asc(coops.name), asc(dailyRecords.recordDate))

  return rows.map((r) => ({
    ...r,
    flockTotalCount: Number(r.flockTotalCount),
    totalEggsButir: Number(r.totalEggsButir),
  })) as ProductionReportRow[]
}

export type FlockPerformanceRow = {
  flockId: string
  flockName: string
  coopName: string
  initialCount: number
  arrivalDate: string
  totalDays: number
  ageWeeks: number
  totalEggsButir: number
  totalDeaths: number
  totalCulled: number
  totalFeedKg: number
  avgHdp: number
  mortalityPct: number
  fcr: number
}

export async function getFlockPerformanceReport(
  farmSchema: string,
  from: string,
  to: string,
  flockId?: string
): Promise<FlockPerformanceRow[]> {
  const { dailyRecords, dailyEggRecords, dailyFeedRecords, flocks, coops, flockDeliveries } =
    getFarmSchema(farmSchema)

  const conditions = [
    sql`${dailyRecords.recordDate} >= ${from}`,
    sql`${dailyRecords.recordDate} <= ${to}`,
    ...(flockId ? [eq(dailyRecords.flockId, flockId)] : []),
  ]

  const rows = await db
    .select({
      flockId: flocks.id,
      flockName: flocks.name,
      coopName: coops.name,
      initialCount: sql<number>`COALESCE((SELECT SUM(${flockDeliveries.quantity}) FROM ${flockDeliveries} WHERE ${flockDeliveries.flockId} = ${flocks.id}), 0)`,
      arrivalDate: flocks.arrivalDate,
      totalDays: sql<number>`COUNT(DISTINCT ${dailyRecords.recordDate})`,
      totalEggsButir: sql<number>`COALESCE(SUM(${dailyEggRecords.qtyButir}), 0)`,
      totalDeaths: sql<number>`COALESCE(SUM(${dailyRecords.deaths}), 0)`,
      totalCulled: sql<number>`COALESCE(SUM(${dailyRecords.culled}), 0)`,
      totalFeedKg: sql<number>`COALESCE(SUM(${dailyFeedRecords.qtyUsed}), 0)`,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(dailyRecords.flockId, flocks.id))
    .innerJoin(coops, eq(flocks.coopId, coops.id))
    .leftJoin(dailyEggRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .leftJoin(dailyFeedRecords, eq(dailyFeedRecords.dailyRecordId, dailyRecords.id))
    .where(and(...conditions))
    .groupBy(flocks.id, flocks.name, coops.name, flocks.arrivalDate)
    .orderBy(flocks.name)

  return rows.map((r) => {
    const initialCount = Number(r.initialCount)
    const totalEggs = Number(r.totalEggsButir)
    const totalDays = Number(r.totalDays)
    const totalDeaths = Number(r.totalDeaths)
    const totalFeedKg = Number(r.totalFeedKg)
    const avgPop = totalDeaths > 0 ? initialCount - totalDeaths / 2 : initialCount
    const avgHdp =
      avgPop > 0 && totalDays > 0
        ? Math.round((totalEggs / (avgPop * totalDays)) * 100 * 10) / 10
        : 0
    const mortalityPct =
      initialCount > 0 ? Math.round((totalDeaths / initialCount) * 100 * 10) / 10 : 0
    const fcr =
      totalEggs > 0 ? Math.round((totalFeedKg / (totalEggs / 1000)) * 100) / 100 : 0
    const arrivalDate = new Date(r.arrivalDate)
    const ageWeeks = Math.floor(
      (Date.now() - arrivalDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
    )

    return {
      flockId: r.flockId,
      flockName: r.flockName,
      coopName: r.coopName,
      initialCount,
      arrivalDate: arrivalDate.toISOString().split('T')[0]!,
      totalDays,
      ageWeeks,
      totalEggsButir: totalEggs,
      totalDeaths,
      totalCulled: Number(r.totalCulled),
      totalFeedKg,
      avgHdp,
      mortalityPct,
      fcr,
    }
  })
}

export async function getDailyEggRecordsByRecordId(
  farmSchema: string,
  dailyRecordId: string
): Promise<{ id: string; stockItemId: string; qtyButir: number; qtyKg: string }[]> {
  const { dailyEggRecords } = getFarmSchema(farmSchema)
  return db
    .select({
      id: dailyEggRecords.id,
      stockItemId: dailyEggRecords.stockItemId,
      qtyButir: dailyEggRecords.qtyButir,
      qtyKg: dailyEggRecords.qtyKg,
    })
    .from(dailyEggRecords)
    .where(eq(dailyEggRecords.dailyRecordId, dailyRecordId))
}

export async function insertEggBundles(
  farmSchema: string,
  bundles: Omit<NewDailyEggBundle, 'id' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  if (bundles.length === 0) return
  const { dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  await db.insert(bundlesTable).values(bundles)
}

export async function deleteBundlesByEggRecordId(
  farmSchema: string,
  dailyEggRecordId: string
): Promise<void> {
  const { dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  await db.delete(bundlesTable).where(eq(bundlesTable.dailyEggRecordId, dailyEggRecordId))
}

export async function getBundlesByEggRecordId(
  farmSchema: string,
  dailyEggRecordId: string
): Promise<DailyEggBundle[]> {
  const { dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(bundlesTable)
    .where(eq(bundlesTable.dailyEggRecordId, dailyEggRecordId))
    .orderBy(bundlesTable.bundleIndex)
}

export async function getNextBundleSequence(
  farmSchema: string,
  flockId: string,
  recordDate: string
): Promise<number> {
  const { dailyRecords, dailyEggRecords, dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({ maxIndex: max(bundlesTable.bundleIndex) })
    .from(bundlesTable)
    .innerJoin(dailyEggRecords, eq(bundlesTable.dailyEggRecordId, dailyEggRecords.id))
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .where(and(eq(dailyRecords.flockId, flockId), eq(dailyRecords.recordDate, recordDate)))
  return (row?.maxIndex ?? 0) + 1
}

export async function insertSingleBundle(
  farmSchema: string,
  data: {
    dailyEggRecordId: string
    bundleIndex: number
    trayCount: number
    topTrayCount: number
    qtyButir: number
    qtyKg: string
    bundleCode: string
  }
): Promise<DailyEggBundle> {
  const { dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  const [inserted] = await db.insert(bundlesTable).values(data).returning()
  return inserted!
}

export async function deleteBundleById(farmSchema: string, bundleId: string): Promise<void> {
  const { dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  await db.delete(bundlesTable).where(eq(bundlesTable.id, bundleId))
}

export type BundleWithStockItem = DailyEggBundle & { stockItemId: string }

export async function getBundlesByFlockDate(
  farmSchema: string,
  flockId: string,
  recordDate: string
): Promise<BundleWithStockItem[]> {
  const { dailyRecords, dailyEggRecords, dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  return db
    .select({
      id: bundlesTable.id,
      dailyEggRecordId: bundlesTable.dailyEggRecordId,
      bundleIndex: bundlesTable.bundleIndex,
      trayCount: bundlesTable.trayCount,
      topTrayCount: bundlesTable.topTrayCount,
      qtyButir: bundlesTable.qtyButir,
      qtyKg: bundlesTable.qtyKg,
      bundleCode: bundlesTable.bundleCode,
      createdAt: bundlesTable.createdAt,
      updatedAt: bundlesTable.updatedAt,
      stockItemId: dailyEggRecords.stockItemId,
    })
    .from(bundlesTable)
    .innerJoin(dailyEggRecords, eq(bundlesTable.dailyEggRecordId, dailyEggRecords.id))
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .where(and(eq(dailyRecords.flockId, flockId), eq(dailyRecords.recordDate, recordDate)))
    .orderBy(asc(bundlesTable.bundleIndex))
}

export async function getBundleWithContext(
  farmSchema: string,
  bundleId: string
): Promise<{ bundle: DailyEggBundle; stockItemId: string; flockId: string; recordDate: string } | null> {
  const { dailyRecords, dailyEggRecords, dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({
      id: bundlesTable.id,
      dailyEggRecordId: bundlesTable.dailyEggRecordId,
      bundleIndex: bundlesTable.bundleIndex,
      trayCount: bundlesTable.trayCount,
      topTrayCount: bundlesTable.topTrayCount,
      qtyButir: bundlesTable.qtyButir,
      qtyKg: bundlesTable.qtyKg,
      bundleCode: bundlesTable.bundleCode,
      createdAt: bundlesTable.createdAt,
      updatedAt: bundlesTable.updatedAt,
      stockItemId: dailyEggRecords.stockItemId,
      flockId: dailyRecords.flockId,
      recordDate: dailyRecords.recordDate,
    })
    .from(bundlesTable)
    .innerJoin(dailyEggRecords, eq(bundlesTable.dailyEggRecordId, dailyEggRecords.id))
    .innerJoin(dailyRecords, eq(dailyEggRecords.dailyRecordId, dailyRecords.id))
    .where(eq(bundlesTable.id, bundleId))
    .limit(1)
  if (!row) return null
  return {
    bundle: {
      id: row.id,
      dailyEggRecordId: row.dailyEggRecordId,
      bundleIndex: row.bundleIndex,
      trayCount: row.trayCount,
      topTrayCount: row.topTrayCount,
      qtyButir: row.qtyButir,
      qtyKg: row.qtyKg,
      bundleCode: row.bundleCode,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    },
    stockItemId: row.stockItemId,
    flockId: row.flockId,
    recordDate: row.recordDate as string,
  }
}
