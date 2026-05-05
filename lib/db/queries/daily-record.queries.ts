import { db } from '@/lib/db'
import {
  dailyRecords, dailyEggRecords, dailyFeedRecords, dailyVaccineRecords,
  inventoryMovements, flocks, coops,
} from '@/lib/db/schema'
import { eq, and, desc, sum, gte, lte, asc, inArray, sql } from 'drizzle-orm'
import type {
  DailyRecord, NewDailyRecord,
  NewDailyEggRecord, NewDailyFeedRecord, NewDailyVaccineRecord,
  NewInventoryMovement,
} from '@/lib/db/schema'

export async function findDailyRecordById(id: string): Promise<DailyRecord | null> {
  const [record] = await db.select().from(dailyRecords).where(eq(dailyRecords.id, id)).limit(1)
  return record ?? null
}

export async function findDailyRecord(flockId: string, recordDate: string): Promise<DailyRecord | null> {
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

export async function getCumulativeDepletionByFlockUpTo(
  flockId: string,
  upToDate: string
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

type SaveDailyRecordTxInput = {
  record: NewDailyRecord
  eggEntries: NewDailyEggRecord[]
  feedEntries: NewDailyFeedRecord[]
  vaccineEntries: NewDailyVaccineRecord[]
  eggMovements: NewInventoryMovement[]
  feedMovements: NewInventoryMovement[]
  vaccineMovements: NewInventoryMovement[]
}

export async function upsertDailyRecordTx(input: SaveDailyRecordTxInput): Promise<DailyRecord> {
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

    await tx.delete(dailyEggRecords).where(eq(dailyEggRecords.dailyRecordId, recordId))
    await tx.delete(dailyFeedRecords).where(eq(dailyFeedRecords.dailyRecordId, recordId))
    await tx.delete(dailyVaccineRecords).where(eq(dailyVaccineRecords.dailyRecordId, recordId))

    // Delete old movements from this record (by sourceId reference)
    await tx
      .delete(inventoryMovements)
      .where(and(
        eq(inventoryMovements.sourceId, recordId),
        inArray(inventoryMovements.sourceType, ['daily_egg_records', 'daily_feed_records', 'daily_vaccine_records'])
      ))

    const eggEntriesWithId = input.eggEntries.map((e) => ({ ...e, dailyRecordId: recordId }))
    const feedEntriesWithId = input.feedEntries.map((e) => ({ ...e, dailyRecordId: recordId }))
    const vaccineEntriesWithId = input.vaccineEntries.map((e) => ({ ...e, dailyRecordId: recordId }))

    if (eggEntriesWithId.length > 0) await tx.insert(dailyEggRecords).values(eggEntriesWithId)
    if (feedEntriesWithId.length > 0) await tx.insert(dailyFeedRecords).values(feedEntriesWithId)
    if (vaccineEntriesWithId.length > 0) await tx.insert(dailyVaccineRecords).values(vaccineEntriesWithId)

    const allMovements = [
      ...input.eggMovements.map((m) => ({ ...m, sourceId: recordId, sourceType: 'daily_egg_records' as const })),
      ...input.feedMovements.map((m) => ({ ...m, sourceId: recordId, sourceType: 'daily_feed_records' as const })),
      ...input.vaccineMovements.map((m) => ({ ...m, sourceId: recordId, sourceType: 'daily_vaccine_records' as const })),
    ]
    if (allMovements.length > 0) await tx.insert(inventoryMovements).values(allMovements)

    return inserted!
  })
}

export type ProductionReportRow = {
  recordDate: string
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  flockTotalCount: number
  deaths: number
  culled: number
}

export async function getProductionReport(
  from: string,
  to: string
): Promise<ProductionReportRow[]> {
  const rows = await db
    .select({
      recordDate: dailyRecords.recordDate,
      coopId: coops.id,
      coopName: coops.name,
      flockId: flocks.id,
      flockName: flocks.name,
      flockTotalCount: sql<number>`COALESCE((SELECT SUM(fd.quantity) FROM flock_deliveries fd WHERE fd.flock_id = ${flocks.id}), 0)`,
      deaths: dailyRecords.deaths,
      culled: dailyRecords.culled,
    })
    .from(dailyRecords)
    .innerJoin(flocks, eq(flocks.id, dailyRecords.flockId))
    .innerJoin(coops, eq(coops.id, flocks.coopId))
    .where(and(gte(dailyRecords.recordDate, from), lte(dailyRecords.recordDate, to)))
    .orderBy(asc(coops.name), asc(dailyRecords.recordDate))

  return rows.map((r) => ({ ...r, flockTotalCount: Number(r.flockTotalCount) }))
}
