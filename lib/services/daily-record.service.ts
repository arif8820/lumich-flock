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
  getBundlesByFlockDate,
  getBundleContributionsByFlockDate,
  getBundleWithContext,
  getBundleById,
  getOpenBundlesForCarryOver as getOpenBundlesQuery,
  type FlockPerformanceRow,
  type BundleWithStockItem,
} from '@/lib/db/queries/daily-record.queries'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'
import { findAllActiveFlocks, findFlockById } from '@/lib/db/queries/flock.queries'
import { sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { assertCanEdit } from '@/lib/services/lock-period.service'
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, sql } from 'drizzle-orm'
import type { DailyRecord, DailyEggBundle } from '@/lib/db/schema'

async function getBundleStockItemIds(farmSchema: string): Promise<string[]> {
  const { stockItems } = getFarmSchema(farmSchema)
  const rows = await db.select({ id: stockItems.id }).from(stockItems).where(eq(stockItems.useBundleMethod, true))
  return rows.map((r) => r.id)
}

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
  const bundleStockItemIds = await getBundleStockItemIds(farmSchema)

  // any: farm schema returns recordDate as Date; cast to public DailyRecord (string) expected by callers
  return upsertDailyRecordTx(farmSchema, {
    bundleStockItemIds,
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
  isOpen: boolean
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
  if (qtyButir <= 0) throw new Error('Jumlah butir harus lebih dari 0 (isi Nampan dan Atas)')
  if (input.qtyKg <= 0) throw new Error('Kg harus lebih dari 0')
  const qtyKgStr = input.qtyKg.toFixed(2)
  const isLateInput = computeIsLateInput(recordDate, now)

  const { dailyRecords, dailyEggRecords, dailyEggBundles: bundlesTable, inventoryMovements, stockItems } = getFarmSchema(farmSchema)

  return db.transaction(async (tx) => {
    // Fetch bundle_target_kg inside the transaction to avoid TOCTOU race — read
    // must be consistent with the bundle insert that follows in the same tx.
    const [stockItemRow] = await tx
      .select({ bundleTargetKg: stockItems.bundleTargetKg })
      .from(stockItems)
      .where(eq(stockItems.id, input.stockItemId))
      .limit(1)
    const targetKg = stockItemRow?.bundleTargetKg ?? null
    const isOpen = targetKg != null ? Number(qtyKgStr) < Number(targetKg) : false

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
        isOpen,
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
      isOpen,
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
  // Check is_open before allowing delete
  const bundleInfo = await getBundleById(farmSchema, bundleId)
  if (!bundleInfo) throw new Error('Ikatan tidak ditemukan')
  if (!bundleInfo.isOpen) throw new Error('Ikatan sudah dilengkapi, tidak bisa dihapus')

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

export type BundleContributionResult = {
  bundleId: string
  bundleCode: string | null
  totalQtyButir: number
  totalQtyKg: string
  isOpen: boolean
}

export type OpenBundleGroup = {
  bundleId: string
  bundleCode: string | null
  bundleIndex: number
  qtyKg: number
  qtyButir: number
  recordDate: string
  stockItemId: string
  stockItemName: string
}

export async function addBundleContribution(
  farmSchema: string,
  input: {
    bundleId: string
    recordDate: string        // YYYY-MM-DD (day 2)
    originalRecordDate: string // YYYY-MM-DD (day 1, from the carry-over list)
    stockItemId: string
    trayCount: number
    topTrayCount: number
    qtyKg: number
    flockId: string
  },
  userId: string,
  role: Role,
  now: Date = new Date()
// catches errors to return result envelope — called from server action
): Promise<{ success: boolean; data?: BundleContributionResult; error?: string }> {
  try {
    // 1. Validate backdate lock period
    validateBackdate(new Date(input.recordDate), now, role)

    // 2. Fetch bundle and verify is_open = true
    const bundle = await getBundleById(farmSchema, input.bundleId)
    if (!bundle) return { success: false, error: 'Ikatan tidak ditemukan' }
    if (!bundle.isOpen) return { success: false, error: 'Ikatan sudah ditutup, tidak bisa ditambah kontribusi' }

    // 3. Verify max carry-over: bundle's recordDate must be H-1 from input.recordDate
    const day1 = new Date(input.originalRecordDate)
    const day2 = new Date(input.recordDate)
    const dayDiffMs = day2.getTime() - day1.getTime()
    const dayDiff = Math.round(dayDiffMs / 86_400_000)
    if (dayDiff !== 1) {
      return { success: false, error: 'Kontribusi hanya diizinkan untuk H-1 (carry-over maksimum 1 hari)' }
    }

    // 4. Input = final totals. Compute delta from current bundle state.
    const totalQtyButir = computeBundleButir(input.trayCount, input.topTrayCount)
    const deltaQtyButir = totalQtyButir - bundle.qtyButir
    const deltaQtyKg = input.qtyKg - Number(bundle.qtyKg)
    if (deltaQtyButir <= 0 || deltaQtyKg <= 0) {
      return { success: false, error: 'Total akhir harus melebihi jumlah yang sudah tersimpan di ikatan ini' }
    }
    const qtyButir = deltaQtyButir
    const qtyKgStr = deltaQtyKg.toFixed(2)
    const isLateInput = computeIsLateInput(new Date(input.recordDate), now)

    const { dailyRecords, dailyEggRecords, inventoryMovements, bundleContributions: contributionsTable, dailyEggBundles: bundlesTableTx } = getFarmSchema(farmSchema)

    const result = await db.transaction(async (tx) => {
      // 5. Upsert daily_records for input.recordDate
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

      // 6. Upsert daily_egg_records for input.recordDate + stockItemId (additive)
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
      const dailyEggRecordId = eggRecord!.id

      // 7. Insert bundle_contributions row (inline in tx for atomicity)
      const [contribution] = await tx
        .insert(contributionsTable)
        .values({
          bundleId: input.bundleId,
          dailyEggRecordId,
          qtyButir,
          qtyKg: qtyKgStr,
          createdBy: userId,
        })
        .returning()

      // 8. Insert inventory_movements
      if (qtyButir > 0) {
        await tx.insert(inventoryMovements).values({
          stockItemId: input.stockItemId,
          flockId: input.flockId,
          movementType: 'in',
          source: 'production',
          sourceType: 'bundle_contributions',
          sourceId: contribution!.id,
          quantity: qtyButir,
          movementDate: input.recordDate,
          createdBy: userId,
        })
      }

      // 9. Update bundle: add qty and close (isOpen = false) — inline in tx for atomicity
      await tx
        .update(bundlesTableTx)
        .set({
          qtyButir: sql`${bundlesTableTx.qtyButir} + ${qtyButir}`,
          qtyKg: sql`${bundlesTableTx.qtyKg} + ${qtyKgStr}::numeric`,
          isOpen: false,
          updatedAt: new Date(),
        })
        .where(eq(bundlesTableTx.id, input.bundleId))

      return {
        bundleId: input.bundleId,
        bundleCode: bundle.bundleCode,
        totalQtyButir,
        totalQtyKg: input.qtyKg.toFixed(2),
        isOpen: false,
      }
    })

    return { success: true, data: result }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function getOpenBundlesForCarryOver(
  farmSchema: string,
  flockId: string,
  inputDate: string
): Promise<{ success: boolean; data?: Record<string, OpenBundleGroup>; error?: string }> {
  try {
    const rows = await getOpenBundlesQuery(farmSchema, flockId, inputDate)
    const grouped: Record<string, OpenBundleGroup> = {}
    for (const row of rows) {
      // Only the oldest open bundle per stock item is surfaced — carry-over max is 1x,
      // so at most one open bundle per stock item should exist. Taking only the first
      // ensures we don't surface multiple partials if data is somehow inconsistent.
      if (!grouped[row.stockItemId]) {
        grouped[row.stockItemId] = row
      }
    }
    return { success: true, data: grouped }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Terjadi kesalahan' }
  }
}

export async function getExistingBundlesForInput(
  farmSchema: string,
  flockId: string,
  recordDate: string
): Promise<Record<string, BundleWithStockItem[]>> {
  const [bundles, carryOverBundles] = await Promise.all([
    getBundlesByFlockDate(farmSchema, flockId, recordDate),
    getBundleContributionsByFlockDate(farmSchema, flockId, recordDate),
  ])

  // Build result: normal bundles first, then carry-over bundles (dedup by id — normal takes priority)
  const seen = new Set<string>()
  const result: Record<string, BundleWithStockItem[]> = {}

  for (const b of bundles) {
    seen.add(b.id)
    if (!result[b.stockItemId]) result[b.stockItemId] = []
    result[b.stockItemId]!.push(b)
  }
  for (const b of carryOverBundles) {
    if (seen.has(b.id)) continue // already in list as a normal bundle
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
