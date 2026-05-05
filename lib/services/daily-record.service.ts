import {
  findDailyRecord,
  upsertDailyRecordTx,
  getTotalDepletionByFlock,
  getCumulativeDepletionByFlockUpTo,
  getProductionReport,
} from '@/lib/db/queries/daily-record.queries'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'
import { findAllActiveFlocks, findFlockById } from '@/lib/db/queries/flock.queries'
import { sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { db } from '@/lib/db'
import { dailyRecords } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import type { DailyRecord } from '@/lib/db/schema'

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

type EggEntry = { stockItemId: string; qtyButir: number; qtyKg: number }
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
  eggEntries: EggEntry[]
  feedEntries: FeedEntry[]
  vaccineEntries: VaccineEntry[]
}

export async function saveDailyRecord(
  input: SaveDailyRecordInput,
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
  const recordDate = new Date(input.recordDate)
  validateBackdate(recordDate, now, role)

  const [flock, dep] = await Promise.all([
    findFlockById(input.flockId),
    getTotalDepletionByFlock(input.flockId),
  ])
  if (!flock) throw new Error('Flock tidak ditemukan')

  const existing = await findDailyRecord(input.flockId, input.recordDate)
  if (!existing) {
    const flockTotalCount = await sumDeliveriesQuantityByFlockId(input.flockId)
    const currentPop = Math.max(0, flockTotalCount - dep.deaths - dep.culled)
    const todayDepletion = input.deaths + input.culled
    if (todayDepletion > currentPop) {
      throw new Error(`Total depletion (${todayDepletion}) melebihi populasi aktif (${currentPop})`)
    }
  }

  // Validate feed/vaccine stock
  for (const entry of input.feedEntries) {
    if (entry.qtyUsed <= 0) continue
    const balance = await getStockBalance(entry.stockItemId)
    if (entry.qtyUsed > balance) {
      throw new Error(`Stok pakan tidak mencukupi (tersedia: ${balance})`)
    }
  }
  for (const entry of input.vaccineEntries) {
    if (entry.qtyUsed <= 0) continue
    const balance = await getStockBalance(entry.stockItemId)
    if (entry.qtyUsed > balance) {
      throw new Error(`Stok vaksin tidak mencukupi (tersedia: ${balance})`)
    }
  }

  const isLateInput = computeIsLateInput(recordDate, now)

  return upsertDailyRecordTx({
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
    eggEntries: input.eggEntries
      .filter((e) => e.qtyButir > 0 || e.qtyKg > 0)
      .map((e) => ({
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
    eggMovements: input.eggEntries
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
  })
}

export type FlockOption = {
  id: string
  name: string
  coopName: string
  totalCount: number
  currentPopulation: number
}

export async function getFlockOptionsForInput(userId: string, role: Role): Promise<FlockOption[]> {
  let rawFlocks = await findAllActiveFlocks()
  if (role === 'operator') {
    const coopIds = new Set(await findAssignedCoopIds(userId))
    rawFlocks = rawFlocks.filter((f) => coopIds.has(f.coopId))
  }
  return Promise.all(
    rawFlocks.map(async (f) => {
      const [dep, flockTotalCount] = await Promise.all([
        getTotalDepletionByFlock(f.id),
        sumDeliveriesQuantityByFlockId(f.id),
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
}

export type ProductionReportResult = {
  rows: EnrichedProductionRow[]
  kpi: {
    totalDeaths: number
    totalCulled: number
  }
}

export async function getProductionReportData(
  from: string,
  to: string,
  role: Role
): Promise<ProductionReportResult> {
  if (role === 'operator') throw new Error('Akses ditolak')

  const rawRows = await getProductionReport(from, to)

  const enriched: EnrichedProductionRow[] = await Promise.all(
    rawRows.map(async (row) => {
      const { deaths: cumDeaths, culled: cumCulled } = await getCumulativeDepletionByFlockUpTo(
        row.flockId,
        row.recordDate
      )
      const activePopulation = Math.max(0, row.flockTotalCount - cumDeaths - cumCulled)
      return {
        recordDate: row.recordDate,
        coopId: row.coopId,
        coopName: row.coopName,
        flockId: row.flockId,
        flockName: row.flockName,
        activePopulation,
        deaths: row.deaths,
        culled: row.culled,
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
  recordId: string,
  input: { deaths?: number; culled?: number; notes?: string },
  userId: string,
  role: Role,
  now: Date = new Date()
): Promise<DailyRecord> {
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
  return updated!
}
