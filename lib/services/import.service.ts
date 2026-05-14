/**
 * Import Service — Sprint 8 (updated)
 * CSV import for: daily_records, customers.
 *
 * Flow:
 *   1. parse(csvText, entity, farmSchema)  → { valid, errors }   (no DB write)
 *   2. commitImport(entity, rows, adminId, farmSchema)            (DB write in transaction)
 *
 * All imported records: is_imported = true, imported_by = adminId.
 * System errors → full rollback, no partial save.
 * Valid rows imported, error rows skipped after user confirmation.
 */

import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { inArray } from 'drizzle-orm'
import type { NewCustomer } from '@/lib/db/schema'
import {
  getActiveEggItems,
  getActiveFeedItems,
  getActiveVaccineItems,
} from '@/lib/services/stock-catalog.service'
import { getStockBalance } from '@/lib/db/queries/inventory.queries'

// ─── Domain error class ───────────────────────────────────────────────────────

export class ImportDomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportDomainError'
  }
}

// ─── CSV parsing helpers ──────────────────────────────────────────────────────

function parseISODate(val: string, field: string, rowNum: number): { date?: string; dateObj?: Date; error?: string } {
  if (!val) return { error: `Baris ${rowNum}: ${field} wajib diisi` }
  const ISO = /^\d{4}-\d{2}-\d{2}$/
  if (!ISO.test(val)) return { error: `Baris ${rowNum}: ${field} format tanggal tidak valid (gunakan YYYY-MM-DD)` }
  const d = new Date(val)
  if (isNaN(d.getTime())) return { error: `Baris ${rowNum}: ${field} tanggal tidak valid` }
  return { date: val, dateObj: d }
}

function parseInt2(val: string, field: string, rowNum: number, required = true): { num?: number; error?: string } {
  if (!val) {
    if (required) return { error: `Baris ${rowNum}: ${field} wajib diisi` }
    return { num: 0 }
  }
  const n = parseInt(val, 10)
  if (isNaN(n)) return { error: `Baris ${rowNum}: ${field} harus berupa angka bulat` }
  return { num: n }
}

function parseFloat2(val: string, field: string, rowNum: number): { num?: number | null; error?: string } {
  if (!val) return { num: null }
  const n = parseFloat(val)
  if (isNaN(n)) return { error: `Baris ${rowNum}: ${field} harus berupa angka` }
  return { num: n }
}

export type ParsedRow<T> = {
  rowNum: number
  data: T
}

export type ParseError = {
  rowNum: number
  errors: string[]
}

export type ParseResult<T> = {
  valid: ParsedRow<T>[]
  errors: ParseError[]
}

function parseCsv(text: string): string[][] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
}

/** Normalise a column header name for matching: lowercase + spaces→underscore */
function normalizeColName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '_')
}

// ─── DailyRecord import ───────────────────────────────────────────────────────

export type DailyRecordImportRow = {
  flockId: string
  recordDate: string
  deaths: number
  culled: number
  notes: string | null
  eggEntries: { stockItemId: string; qtyButir: number; qtyKg: number }[]
  feedEntries: { stockItemId: string; qtyUsed: number }[]
  vaccineEntries: { stockItemId: string; qtyUsed: number }[]
}

type DynColMeta =
  | { type: 'egg'; stockItemId: string; field: 'butir' | 'kg' }
  | { type: 'feed'; stockItemId: string; field: 'qty' }
  | { type: 'vaccine'; stockItemId: string; field: 'qty' }

/**
 * Parse CSV text for daily_records import.
 *
 * Fixed columns (index 0-4): flock_id, record_date, deaths, culled, notes
 * Dynamic columns (index ≥ 5): derived from active egg/feed/vaccine stock items.
 *   Egg:     egg_{normalizedName}_butir  /  egg_{normalizedName}_kg
 *   Feed:    feed_{normalizedName}_kg    (maps to qtyUsed)
 *   Vaccine: vaccine_{normalizedName}_qty (maps to qtyUsed)
 */
export async function parseDailyRecordsCsv(
  csvText: string,
  farmSchema: string
): Promise<ParseResult<DailyRecordImportRow>> {
  const rows = parseCsv(csvText)
  if (rows.length === 0) return { valid: [], errors: [] }

  const [headerRow, ...dataRows] = rows
  const headers = (headerRow ?? []).map(normalizeColName)

  // Fetch active items for dynamic column mapping
  const [eggItems, feedItems, vaccineItems] = await Promise.all([
    getActiveEggItems(farmSchema),
    getActiveFeedItems(farmSchema),
    getActiveVaccineItems(farmSchema),
  ])

  // Build column map: colIndex → DynColMeta
  const colMap = new Map<number, DynColMeta>()

  for (let i = 5; i < headers.length; i++) {
    const h = headers[i] ?? ''

    // Egg columns
    for (const item of eggItems) {
      const norm = normalizeColName(item.name)
      if (h === `egg_${norm}_butir`) {
        colMap.set(i, { type: 'egg', stockItemId: item.id, field: 'butir' })
        break
      }
      if (h === `egg_${norm}_kg`) {
        colMap.set(i, { type: 'egg', stockItemId: item.id, field: 'kg' })
        break
      }
    }
    if (colMap.has(i)) continue

    // Feed columns
    for (const item of feedItems) {
      const norm = normalizeColName(item.name)
      if (h === `feed_${norm}_kg`) {
        colMap.set(i, { type: 'feed', stockItemId: item.id, field: 'qty' })
        break
      }
    }
    if (colMap.has(i)) continue

    // Vaccine columns
    for (const item of vaccineItems) {
      const norm = normalizeColName(item.name)
      if (h === `vaccine_${norm}_dosis`) {
        colMap.set(i, { type: 'vaccine', stockItemId: item.id, field: 'qty' })
        break
      }
    }
  }

  // Batch flock existence check — one query for all unique flock IDs in the CSV
  // Filter to valid UUIDs first — passing non-UUID strings to inArray throws a Postgres cast error
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const uniqueFlockIds = [...new Set(dataRows.map((cols) => cols[0]).filter(Boolean))] as string[]
  const validUUIDs = uniqueFlockIds.filter((id) => UUID_RE.test(id))
  const s = getFarmSchema(farmSchema)
  const validFlocks = validUUIDs.length > 0
    ? await db.select({ id: s.flocks.id }).from(s.flocks).where(inArray(s.flocks.id, validUUIDs))
    : []
  const validFlockIdSet = new Set(validFlocks.map((f) => f.id))

  // Build item name lookup map for user-friendly error messages
  const itemNameMap = new Map<string, string>()
  for (const item of feedItems) itemNameMap.set(item.id, item.name)
  for (const item of vaccineItems) itemNameMap.set(item.id, item.name)

  // Fetch starting balances for all feed + vaccine items (running balance for stock validation)
  const allConsumableIds = [...feedItems.map((i) => i.id), ...vaccineItems.map((i) => i.id)]
  const balanceEntries = await Promise.all(
    allConsumableIds.map(async (id) => [id, await getStockBalance(farmSchema, id)] as const)
  )
  const balanceMap = new Map(balanceEntries)
  let hasStockError = false

  const valid: ParsedRow<DailyRecordImportRow>[] = []
  const errors: ParseError[] = []

  for (const [idx, cols] of dataRows.entries()) {
    const rowNum = idx + 2
    const rowErrors: string[] = []

    const [flockId, recordDateStr, deathsStr, culledStr, notesRaw] = cols

    // Validate flock_id using pre-fetched set
    if (!flockId) {
      rowErrors.push(`Baris ${rowNum}: flock_id wajib diisi`)
    } else if (!validFlockIdSet.has(flockId)) {
      rowErrors.push(`Baris ${rowNum}: flock_id "${flockId}" tidak ditemukan`)
    }

    const { date: recordDate, error: dateErr } = parseISODate(recordDateStr ?? '', 'record_date', rowNum)
    if (dateErr) rowErrors.push(dateErr)

    const { num: deaths, error: e1 } = parseInt2(deathsStr ?? '', 'deaths', rowNum)
    if (e1) rowErrors.push(e1)
    const { num: culled, error: e2 } = parseInt2(culledStr ?? '', 'culled', rowNum)
    if (e2) rowErrors.push(e2)

    if (rowErrors.length > 0) {
      errors.push({ rowNum, errors: rowErrors })
      continue
    }

    // Build accumulators keyed by stockItemId
    const eggMap = new Map<string, { qtyButir: number; qtyKg: number }>()
    const feedMap = new Map<string, { qtyUsed: number }>()
    const vaccineMap = new Map<string, { qtyUsed: number }>()

    // Initialise all known items to 0
    for (const item of eggItems) eggMap.set(item.id, { qtyButir: 0, qtyKg: 0 })
    for (const item of feedItems) feedMap.set(item.id, { qtyUsed: 0 })
    for (const item of vaccineItems) vaccineMap.set(item.id, { qtyUsed: 0 })

    // Fill in values from dynamic columns
    for (const [colIdx, meta] of colMap.entries()) {
      const rawVal = cols[colIdx] ?? ''
      if (meta.type === 'egg') {
        const entry = eggMap.get(meta.stockItemId) ?? { qtyButir: 0, qtyKg: 0 }
        if (meta.field === 'butir') {
          const { num } = parseInt2(rawVal, `col_${colIdx}`, rowNum, false)
          entry.qtyButir = num ?? 0
        } else {
          const { num } = parseFloat2(rawVal, `col_${colIdx}`, rowNum)
          entry.qtyKg = num ?? 0
        }
        eggMap.set(meta.stockItemId, entry)
      } else if (meta.type === 'feed') {
        const entry = feedMap.get(meta.stockItemId) ?? { qtyUsed: 0 }
        const { num } = parseFloat2(rawVal, `col_${colIdx}`, rowNum)
        entry.qtyUsed = num ?? 0
        feedMap.set(meta.stockItemId, entry)
      } else {
        const entry = vaccineMap.get(meta.stockItemId) ?? { qtyUsed: 0 }
        const { num } = parseFloat2(rawVal, `col_${colIdx}`, rowNum)
        entry.qtyUsed = num ?? 0
        vaccineMap.set(meta.stockItemId, entry)
      }
    }

    // Running balance check — collect errors and deductions separately per-row,
    // then only apply deductions if no stock errors occurred for this row.
    const rowStockErrors: string[] = []
    const rowStockDeductions: Array<[string, number]> = []

    for (const [stockItemId, e] of feedMap.entries()) {
      if (e.qtyUsed <= 0) continue
      const itemName = itemNameMap.get(stockItemId) ?? stockItemId
      const bal = balanceMap.get(stockItemId) ?? 0
      const qtyRounded = Math.round(e.qtyUsed)
      if (qtyRounded > bal) {
        rowStockErrors.push(
          `Baris ${rowNum} (${recordDateStr ?? ''}): stok ${itemName} tidak mencukupi (tersedia: ${bal}, dibutuhkan: ${qtyRounded})`
        )
      } else {
        rowStockDeductions.push([stockItemId, bal - qtyRounded])
      }
    }

    for (const [stockItemId, e] of vaccineMap.entries()) {
      if (e.qtyUsed <= 0) continue
      const itemName = itemNameMap.get(stockItemId) ?? stockItemId
      const bal = balanceMap.get(stockItemId) ?? 0
      const qtyRounded = Math.round(e.qtyUsed)
      if (qtyRounded > bal) {
        rowStockErrors.push(
          `Baris ${rowNum} (${recordDateStr ?? ''}): stok ${itemName} tidak mencukupi (tersedia: ${bal}, dibutuhkan: ${qtyRounded})`
        )
      } else {
        rowStockDeductions.push([stockItemId, bal - qtyRounded])
      }
    }

    if (rowStockErrors.length > 0) {
      rowErrors.push(...rowStockErrors)
      hasStockError = true
    } else {
      for (const [id, newBal] of rowStockDeductions) balanceMap.set(id, newBal)
    }

    if (rowErrors.length > 0) {
      errors.push({ rowNum, errors: rowErrors })
      continue
    }

    valid.push({
      rowNum,
      data: {
        flockId: flockId!,
        recordDate: recordDate!,
        deaths: deaths!,
        culled: culled!,
        notes: notesRaw || null,
        eggEntries: Array.from(eggMap.entries()).map(([stockItemId, v]) => ({ stockItemId, ...v })),
        feedEntries: Array.from(feedMap.entries()).map(([stockItemId, v]) => ({ stockItemId, ...v })),
        vaccineEntries: Array.from(vaccineMap.entries()).map(([stockItemId, v]) => ({ stockItemId, ...v })),
      },
    })
  }

  if (hasStockError) return { valid: [], errors }
  return { valid, errors }
}

// ─── Customer import ──────────────────────────────────────────────────────────

export type CustomerImportRow = Omit<NewCustomer, 'isImported' | 'importedBy'>

/**
 * Expected CSV columns:
 * name, type (retail|wholesale|distributor), phone (opt), address (opt),
 * credit_limit (opt), payment_terms (opt)
 */
export function parseCustomersCsv(csvText: string): ParseResult<CustomerImportRow> {
  const rows = parseCsv(csvText)
  const [, ...dataRows] = rows

  const valid: ParsedRow<CustomerImportRow>[] = []
  const errors: ParseError[] = []

  const validTypes = ['retail', 'wholesale', 'distributor'] as const

  dataRows.forEach((cols, idx) => {
    const rowNum = idx + 2
    const rowErrors: string[] = []

    const [name, type, phone, address, creditLimitStr, paymentTermsStr] = cols

    if (!name) rowErrors.push(`Baris ${rowNum}: name wajib diisi`)
    if (type && !validTypes.includes(type as typeof validTypes[number])) {
      rowErrors.push(`Baris ${rowNum}: type harus salah satu dari retail|wholesale|distributor`)
    }

    const { num: creditLimit } = parseFloat2(creditLimitStr ?? '', 'credit_limit', rowNum)
    const { num: paymentTerms } = parseInt2(paymentTermsStr ?? '', 'payment_terms', rowNum, false)

    if (rowErrors.length > 0) {
      errors.push({ rowNum, errors: rowErrors })
      return
    }

    valid.push({
      rowNum,
      data: {
        name: name!,
        type: (type as typeof validTypes[number]) || null,
        phone: phone || null,
        address: address || null,
        creditLimit: creditLimit != null ? String(creditLimit) : '0',
        paymentTerms: paymentTerms ?? 0,
        status: 'active',
      },
    })
  })

  return { valid, errors }
}

// ─── DB write ─────────────────────────────────────────────────────────────────

export type ImportEntity = 'daily_records' | 'customers'

export type ImportResult = {
  inserted: number
  skipped: number
}

/**
 * Writes valid parsed rows to DB inside a single transaction.
 * Any system error → full rollback.
 * admin-only: sets is_imported = true, imported_by = adminId.
 *
 * farmSchema is required to scope DB writes to the correct farm schema.
 */
export async function commitImport(
  entity: ImportEntity,
  // any: dynamic row types across entity types
  rows: ParsedRow<Record<string, unknown>>[],
  adminId: string,
  farmSchema: string
): Promise<ImportResult> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 }

  const {
    dailyRecords,
    dailyEggRecords,
    dailyFeedRecords,
    dailyVaccineRecords,
    inventoryMovements,
    customers: farmCustomers,
  } = getFarmSchema(farmSchema)

  return db.transaction(async (tx) => {
    let inserted = 0

    if (entity === 'daily_records') {
      for (const row of rows) {
        const rowData = row.data as unknown as DailyRecordImportRow

        try {
          const [newRecord] = await tx
            .insert(dailyRecords)
            .values([{
              flockId: rowData.flockId,
              recordDate: String(rowData.recordDate),
              deaths: rowData.deaths,
              culled: rowData.culled,
              notes: rowData.notes,
              isLateInput: false,
              isImported: true,
              importedBy: adminId,
              createdBy: adminId,
            }])
            .returning()

          if (!newRecord) throw new ImportDomainError(`Gagal menyimpan daily record baris ${row.rowNum}`)
          const dailyRecordId = newRecord.id

          const eggInserts = rowData.eggEntries.filter((e) => e.qtyButir > 0 || e.qtyKg > 0)
          if (eggInserts.length > 0) {
            await tx.insert(dailyEggRecords).values(
              eggInserts.map((e) => ({
                dailyRecordId,
                stockItemId: e.stockItemId,
                qtyButir: e.qtyButir,
                qtyKg: String(e.qtyKg),
              }))
            )
          }

          const feedInserts = rowData.feedEntries.filter((e) => e.qtyUsed > 0)
          if (feedInserts.length > 0) {
            await tx.insert(dailyFeedRecords).values(
              feedInserts.map((e) => ({
                dailyRecordId,
                stockItemId: e.stockItemId,
                qtyUsed: String(e.qtyUsed),
              }))
            )
          }

          const vaccineInserts = rowData.vaccineEntries.filter((e) => e.qtyUsed > 0)
          if (vaccineInserts.length > 0) {
            await tx.insert(dailyVaccineRecords).values(
              vaccineInserts.map((e) => ({
                dailyRecordId,
                stockItemId: e.stockItemId,
                qtyUsed: String(e.qtyUsed),
              }))
            )
          }

          const movementDate = String(rowData.recordDate)
          const eggMovementInserts = eggInserts.filter((e) => e.qtyButir > 0)
          const movements = [
            ...eggMovementInserts.map((e) => ({
              stockItemId: e.stockItemId,
              flockId: rowData.flockId,
              movementType: 'in' as const,
              source: 'import' as const,
              sourceType: 'daily_egg_records' as const,
              sourceId: dailyRecordId,
              quantity: e.qtyButir,
              movementDate,
              isImported: true,
              importedBy: adminId,
              createdBy: adminId,
            })),
            ...feedInserts.map((e) => ({
              stockItemId: e.stockItemId,
              flockId: rowData.flockId,
              movementType: 'out' as const,
              source: 'import' as const,
              sourceType: 'daily_feed_records' as const,
              sourceId: dailyRecordId,
              quantity: Math.round(Number(e.qtyUsed)),
              movementDate,
              isImported: true,
              importedBy: adminId,
              createdBy: adminId,
            })),
            ...vaccineInserts.map((e) => ({
              stockItemId: e.stockItemId,
              flockId: rowData.flockId,
              movementType: 'out' as const,
              source: 'import' as const,
              sourceType: 'daily_vaccine_records' as const,
              sourceId: dailyRecordId,
              quantity: Math.round(Number(e.qtyUsed)),
              movementDate,
              isImported: true,
              importedBy: adminId,
              createdBy: adminId,
            })),
          ]
          if (movements.length > 0) await tx.insert(inventoryMovements).values(movements)
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (msg.includes('daily_records_flock_date_idx') || msg.includes('unique')) {
            throw new ImportDomainError(`Data untuk flock pada tanggal tersebut sudah ada (baris ${row.rowNum})`)
          }
          throw e
        }

        inserted++
      }
    } else if (entity === 'customers') {
      for (const row of rows) {
        await tx.insert(farmCustomers).values({
          ...(row.data as NewCustomer),
          isImported: true,
          importedBy: adminId,
          createdBy: adminId,
        })
        inserted++
      }
    }

    return { inserted, skipped: 0 }
  })
}

// ─── CSV templates ───────────────────────────────────────────────────────────

/**
 * Generate a dynamic CSV template for daily_records based on active stock items.
 * Returns the header row followed by a newline (no data rows).
 */
export async function generateDailyRecordsCsvTemplate(farmSchema: string): Promise<string> {
  const [eggItems, feedItems, vaccineItems] = await Promise.all([
    getActiveEggItems(farmSchema),
    getActiveFeedItems(farmSchema),
    getActiveVaccineItems(farmSchema),
  ])

  const fixedCols = ['flock_id', 'record_date', 'deaths', 'culled', 'notes']

  const eggCols = eggItems.flatMap((item) => {
    const norm = normalizeColName(item.name)
    return [`egg_${norm}_butir`, `egg_${norm}_kg`]
  })

  const feedCols = feedItems.map((item) => {
    const norm = normalizeColName(item.name)
    return `feed_${norm}_kg`
  })

  const vaccineCols = vaccineItems.map((item) => {
    const norm = normalizeColName(item.name)
    return `vaccine_${norm}_dosis`
  })

  const header = [...fixedCols, ...eggCols, ...feedCols, ...vaccineCols].join(',')

  const exampleDate = new Date().toISOString().split('T')[0]!
  const exampleRow = [
    'GANTI-DENGAN-FLOCK-ID',
    exampleDate,
    '0',
    '0',
    '',
    ...Array(eggCols.length + feedCols.length + vaccineCols.length).fill('0'),
  ].join(',')

  return header + '\n' + exampleRow + '\n'
}

/**
 * Returns a static CSV template header for customers.
 */
export function getCsvTemplate(_entity: 'customers'): string {
  return 'name,type,phone,address,credit_limit,payment_terms\n'
}
