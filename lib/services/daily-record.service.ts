import {
  findDailyRecord,
  upsertDailyRecordTx,
  getTotalDepletionByFlock,
  getCumulativeDepletionByFlockUpTo,
  getProductionReport,
  getFlockPerformanceReport,
  getDailyEggRecordsByRecordId,
  getBundlesByEggRecordId,
  getNextBundleSequence,
  deleteBundleById,
  getBundlesByFlockDate,
  getBundleWithContext,
  type FlockPerformanceRow,
  type BundleWithStockItem,
} from '@/lib/db/queries/daily-record.queries'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'
import { findAllActiveFlocks, findFlockById } from '@/lib/db/queries/flock.queries'
import { sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, sql } from 'drizzle-orm'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { DailyRecord, DailyEggBundle } from '@/lib/db/schema'

export type Role = 'operator' | 'supervisor' | 'admin'

export function validateBackdate(recordDate: Date, now: Date, role: Role): void {
  if (recordDate > now) throw new Error('Tidak dapat input untuk tanggal masa depan')
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const diffDays = Math.round((nowDay - recDay) / 86_400_000)
  const max = role === 'operator' ? 1 : role === 'supervisor' ? 3 : Infinity
  if (diffDays > max) {
    const limit = role === 'operator' ? 'H-1' : 'H-3'
    throw new Error(`Input hanya diizinkan sampai ${limit} untuk role ini`)
  }
}

export function computeIsLateInput(recordDate: Date, submittedAt: Date): boolean {
  const endOfDay = new Date(recordDate)
  endOfDay.setUTCHours(23, 59, 59, 999)
  return submittedAt > endOfDay
}

export function computeActivePopulation(
  initialCount: number,
  records: { deaths: number; culled: number }[]
): number {
  const depletion = records.reduce((acc, r) => acc + r.deaths + r.culled, 0)
  return Math.max(0, initialCount - depletion)
}

type FeedEntry = { stockItemId: string; qtyUsed: number }
type VaccineEntry = { stockItemId: string; qtyUsed: number }

type SaveDailyRecordInput = {
  flockId: string
  recordDate: string // YYYY-MM-DD
  deaths: number
  culled: number
  eggsCracked: number
  eggsAbnormal: number
  notes?: string
  eggEntries: Array<{ stockItemId: string; qtyButir: number; qtyKg: number }>
  feedEntries: FeedEntry[]
  vaccineEntries: VaccineEntry[]
}

function computeBundleButir(trayCount: number, topTrayCount: number): number {
  return (trayCount - 1) * 30 + topTrayCount
}

function formatBundleCode(recordDate: string, seq: number): string {
  const [y, m, d] = recordDate.split('-') as [string, string, string]
  return `${d}${m}${y.slice(2)}-${String(seq).padStart(3, '0')}`
}

export async function saveDailyRecord(
  farmSchema: string,
  input: SaveDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
  const recordDate = new Date(input.recordDate)
  validateBackdate(recordDate, now, role)

  const [flock, dep] = await Promise.all([
    findFlockById(farmSchema, input.flockId),
    getTotalDepletionByFlock(farmSchema, input.flockId),
  ])
  if (!flock) throw new Error('Flock tidak ditemukan')

  const existing = await findDailyRecord(farmSchema, input.flockId, input.recordDate)
  if (!existing) {
    const flockTotalCount = await sumDeliveriesQuantityByFlockId(farmSchema, input.flockId)
    const currentPop = Math.max(0, flockTotalCount - dep.deaths - dep.culled)
    const todayDepletion = input.deaths + input.culled
    if (todayDepletion > currentPop) {
      throw new Error(`Total depletion (${todayDepletion}) melebihi populasi aktif (${currentPop})`)
    }
  }

  // Validate feed/vaccine stock
  for (const entry of input.feedEntries) {
    if (entry.qtyUsed <= 0) continue
    const balance = await getStockBalance(farmSchema, entry.stockItemId)
    if (entry.qtyUsed > balance) {
      throw new Error(`Stok pakan tidak mencukupi (tersedia: ${balance})`)
    }
  }
  for (const entry of input.vaccineEntries) {
    if (entry.qtyUsed <= 0) continue
    const balance = await getStockBalance(farmSchema, entry.stockItemId)
    if (entry.qtyUsed > balance) {
      throw new Error(`Stok vaksin tidak mencukupi (tersedia: ${balance})`)
    }
  }

  const isLateInput = computeIsLateInput(recordDate, now)

  const validEggEntries = input.eggEntries.filter((e) => e.qtyButir > 0 || e.qtyKg > 0)

  // any: farm schema returns recordDate as Date; cast to public DailyRecord (string) expected by callers
  return upsertDailyRecordTx(farmSchema, {
    record: {
      flockId: input.flockId,
      recordDate: input.recordDate,
      deaths: input.deaths,
      culled: input.culled,
      eggsCracked: input.eggsCracked,
      eggsAbnormal: input.eggsAbnormal,
      notes: input.notes ?? null,
      isLateInput,
      createdBy: userId,
    },
    eggEntries: validEggEntries.map((e) => ({
      dailyRecordId: '', // will be set in tx
      stockItemId: e.stockItemId,
      qtyButir: e.qtyButir,
      qtyKg: String(e.qtyKg),
    })),
    feedEntries: input.feedEntries
      .filter((e) => e.qtyUsed > 0)
      .map((e) => ({
        dailyRecordId: '',
        stockItemId: e.stockItemId,
        qtyUsed: String(e.qtyUsed),
      })),
    vaccineEntries: input.vaccineEntries
      .filter((e) => e.qtyUsed > 0)
      .map((e) => ({
        dailyRecordId: '',
        stockItemId: e.stockItemId,
        qtyUsed: String(e.qtyUsed),
      })),
    eggMovements: validEggEntries
      .filter((e) => e.qtyButir > 0)
      .map((e) => ({
        stockItemId: e.stockItemId,
        flockId: input.flockId,
        movementType: 'in' as const,
        source: 'production' as const,
        sourceType: 'daily_egg_records' as const,
        sourceId: null,
        quantity: e.qtyButir,
        movementDate: input.recordDate,
        createdBy: userId,
      })),
    feedMovements: input.feedEntries
      .filter((e) => e.qtyUsed > 0)
      .map((e) => ({
        stockItemId: e.stockItemId,
        flockId: input.flockId,
        movementType: 'out' as const,
        source: 'production' as const,
        sourceType: 'daily_feed_records' as const,
        sourceId: null,
        quantity: Math.round(e.qtyUsed),
        movementDate: input.recordDate,
        createdBy: userId,
      })),
    vaccineMovements: input.vaccineEntries
      .filter((e) => e.qtyUsed > 0)
      .map((e) => ({
        stockItemId: e.stockItemId,
        flockId: input.flockId,
        movementType: 'out' as const,
        source: 'production' as const,
        sourceType: 'daily_vaccine_records' as const,
        sourceId: null,
        quantity: Math.round(e.qtyUsed),
        movementDate: input.recordDate,
        createdBy: userId,
      })),
  // any: farm schema date fields (recordDate: Date) differ from public DailyRecord type (recordDate: string)
  }) as unknown as DailyRecord
}

export type SavedBundle = {
  bundleCode: string
  bundleIndex: number
  qtyButir: number
  qtyKg: string
}

export async function saveSingleBundle(
  farmSchema: string,
  input: {
    flockId: string
    recordDate: string
    stockItemId: string
    trayCount: number
    topTrayCount: number
    qtyKg: number
  },
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<SavedBundle> {
  const recordDate = new Date(input.recordDate)
  validateBackdate(recordDate, now, role)

  const flock = await findFlockById(farmSchema, input.flockId)
  if (!flock) throw new Error('Flock tidak ditemukan')

  const qtyButir = computeBundleButir(input.trayCount, input.topTrayCount)
  const qtyKgStr = input.qtyKg.toFixed(2)
  const isLateInput = computeIsLateInput(recordDate, now)

  const { dailyRecords, dailyEggRecords, dailyEggBundles: bundlesTable, inventoryMovements } = getFarmSchema(farmSchema)

  return db.transaction(async (tx) => {
    // Upsert daily_records header
    const [record] = await tx
      .insert(dailyRecords)
      .values({
        flockId: input.flockId,
        recordDate: input.recordDate,
        deaths: 0,
        culled: 0,
        eggsCracked: 0,
        eggsAbnormal: 0,
        notes: null,
        isLateInput,
        createdBy: userId,
      })
      .onConflictDoUpdate({
        target: [dailyRecords.flockId, dailyRecords.recordDate],
        set: { isLateInput },
      })
      .returning()
    const recordId = record!.id

    // Get next sequence
    const seq = await getNextBundleSequence(farmSchema, input.flockId, input.recordDate)
    const bundleCode = formatBundleCode(input.recordDate, seq)

    // Upsert daily_egg_records (add to running total)
    const [eggRecord] = await tx
      .insert(dailyEggRecords)
      .values({
        dailyRecordId: recordId,
        stockItemId: input.stockItemId,
        qtyButir,
        qtyKg: qtyKgStr,
      })
      .onConflictDoUpdate({
        target: [dailyEggRecords.dailyRecordId, dailyEggRecords.stockItemId],
        set: {
          qtyButir: sql`${dailyEggRecords.qtyButir} + ${qtyButir}`,
          qtyKg: sql`${dailyEggRecords.qtyKg} + ${qtyKgStr}::numeric`,
        },
      })
      .returning()

    // Insert bundle row
    const [bundle] = await tx
      .insert(bundlesTable)
      .values({
        dailyEggRecordId: eggRecord!.id,
        bundleIndex: seq,
        trayCount: input.trayCount,
        topTrayCount: input.topTrayCount,
        qtyButir,
        qtyKg: qtyKgStr,
        bundleCode,
      })
      .returning()

    // Insert inventory movement
    if (qtyButir > 0) {
      await tx.insert(inventoryMovements).values({
        stockItemId: input.stockItemId,
        flockId: input.flockId,
        movementType: 'in',
        source: 'production',
        sourceType: 'daily_egg_records',
        sourceId: bundle!.id,
        quantity: qtyButir,
        movementDate: input.recordDate,
        createdBy: userId,
      })
    }

    return {
      bundleCode: bundle!.bundleCode!,
      bundleIndex: bundle!.bundleIndex,
      qtyButir,
      qtyKg: qtyKgStr,
    }
  })
}

export async function deleteBundle(
  farmSchema: string,
  bundleId: string,
  _userId: string,
  role: Role,
  now: Date = new Date()
): Promise<void> {
  const ctx = await getBundleWithContext(farmSchema, bundleId)
  if (!ctx) throw new Error('Ikatan tidak ditemukan')

  assertCanEdit(new Date(ctx.recordDate), role, now)

  const { dailyEggRecords, inventoryMovements } = getFarmSchema(farmSchema)

  await db.transaction(async (tx) => {
    // Subtract from daily_egg_records total
    await tx
      .update(dailyEggRecords)
      .set({
        qtyButir: sql`${dailyEggRecords.qtyButir} - ${ctx.bundle.qtyButir}`,
        qtyKg: sql`${dailyEggRecords.qtyKg} - ${ctx.bundle.qtyKg}::numeric`,
      })
      .where(eq(dailyEggRecords.id, ctx.bundle.dailyEggRecordId))

    // Delete bundle
    const { dailyEggBundles: bundlesTable } = getFarmSchema(farmSchema)
    await tx.delete(bundlesTable).where(eq(bundlesTable.id, bundleId))

    // Delete matching inventory movement
    await tx
      .delete(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.stockItemId, ctx.stockItemId),
          eq(inventoryMovements.flockId, ctx.flockId),
          eq(inventoryMovements.quantity, ctx.bundle.qtyButir),
          eq(inventoryMovements.movementDate, ctx.recordDate),
          eq(inventoryMovements.sourceType, 'daily_egg_records'),
          eq(inventoryMovements.sourceId, bundleId),
        )
      )
  })
}

export async function getExistingBundlesForInput(
  farmSchema: string,
  flockId: string,
  recordDate: string
): Promise<Record<string, BundleWithStockItem[]>> {
  const bundles = await getBundlesByFlockDate(farmSchema, flockId, recordDate)
  const result: Record<string, BundleWithStockItem[]> = {}
  for (const b of bundles) {
    if (!result[b.stockItemId]) result[b.stockItemId] = []
    result[b.stockItemId]!.push(b)
  }
  return result
}

export type { BundleWithStockItem }

export type FlockOption = {
  id: string
  name: string
  coopName: string
  totalCount: number
  currentPopulation: number
}

export async function getFlockOptionsForInput(farmSchema: string, userId: string, role: Role): Promise<FlockOption[]> {
  let rawFlocks = await findAllActiveFlocks(farmSchema)
  if (role === 'operator') {
    const coopIds = new Set(await findAssignedCoopIds(farmSchema, userId))
    rawFlocks = rawFlocks.filter((f) => coopIds.has(f.coopId))
  }
  return Promise.all(
    rawFlocks.map(async (f) => {
      const [dep, flockTotalCount] = await Promise.all([
        getTotalDepletionByFlock(farmSchema, f.id),
        sumDeliveriesQuantityByFlockId(farmSchema, f.id),
      ])
      return {
        id: f.id,
        name: f.name,
        coopName: f.coopName,
        totalCount: flockTotalCount,
        currentPopulation: Math.max(0, flockTotalCount - dep.deaths - dep.culled),
      }
    })
  )
}

export type EnrichedProductionRow = {
  recordDate: string
  coopId: string
  coopName: string
  flockId: string
  flockName: string
  activePopulation: number
  deaths: number
  culled: number
  totalEggsButir: number
  hdp: number
}

export type ProductionReportResult = {
  rows: EnrichedProductionRow[]
  kpi: {
    totalDeaths: number
    totalCulled: number
  }
}

export async function getProductionReportData(
  farmSchema: string,
  from: string,
  to: string,
  role: Role,
  coopId?: string
): Promise<ProductionReportResult> {
  if (role === 'operator') throw new Error('Akses ditolak')

  const rawRows = await getProductionReport(farmSchema, from, to, coopId)

  const enriched: EnrichedProductionRow[] = await Promise.all(
    rawRows.map(async (row) => {
      const { deaths: cumDeaths, culled: cumCulled } = await getCumulativeDepletionByFlockUpTo(
        farmSchema,
        row.flockId,
        row.recordDate as string
      )
      const activePopulation = Math.max(0, row.flockTotalCount - cumDeaths - cumCulled)
      const hdp = activePopulation > 0
        ? Math.round((row.totalEggsButir / activePopulation) * 100 * 10) / 10
        : 0
      return {
        recordDate: row.recordDate as string,
        coopId: row.coopId,
        coopName: row.coopName,
        flockId: row.flockId,
        flockName: row.flockName,
        activePopulation,
        deaths: row.deaths,
        culled: row.culled,
        totalEggsButir: row.totalEggsButir,
        hdp,
      }
    })
  )

  const totalDeaths = enriched.reduce((s, r) => s + r.deaths, 0)
  const totalCulled = enriched.reduce((s, r) => s + r.culled, 0)

  return {
    rows: enriched,
    kpi: { totalDeaths, totalCulled },
  }
}

export async function updateDailyRecordAyam(
  farmSchema: string,
  recordId: string,
  input: { deaths?: number; culled?: number; notes?: string },
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
  const { dailyRecords } = getFarmSchema(farmSchema)
  const [existing] = await db.select().from(dailyRecords).where(eq(dailyRecords.id, recordId)).limit(1)
  if (!existing) throw new Error('Data harian tidak ditemukan')

  assertCanEdit(new Date(existing.recordDate), role, now)

  const updateSet: Record<string, unknown> = {}
  if (input.deaths !== undefined) updateSet.deaths = input.deaths
  if (input.culled !== undefined) updateSet.culled = input.culled
  if (input.notes !== undefined) updateSet.notes = input.notes

  const [updated] = await db
    .update(dailyRecords)
    .set(updateSet)
    .where(eq(dailyRecords.id, recordId))
    .returning()
  // any: farm schema date fields (recordDate: Date) differ from public DailyRecord type (recordDate: string)
  return updated! as unknown as DailyRecord
}

export type { FlockPerformanceRow }

export async function getFlockPerformanceData(
  farmSchema: string,
  from: string,
  to: string,
  flockId?: string
): Promise<FlockPerformanceRow[]> {
  return getFlockPerformanceReport(farmSchema, from, to, flockId)
}

export async function getExistingBundlesForRecord(
  farmSchema: string,
  dailyRecordId: string
): Promise<Record<string, DailyEggBundle[]>> {
  const eggRecords = await getDailyEggRecordsByRecordId(farmSchema, dailyRecordId)
  const result: Record<string, DailyEggBundle[]> = {}
  for (const er of eggRecords) {
    result[er.stockItemId] = await getBundlesByEggRecordId(farmSchema, er.id)
  }
  return result
}
