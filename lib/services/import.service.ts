/**
 * Import Service — Sprint 8
 * CSV import for: flocks, daily_records, customers, opening stock.
 *
 * Flow:
 *   1. parse(csvText, entity)  → { valid, errors }   (no DB write)
 *   2. importRows(valid, entity, adminId)             (DB write in transaction)
 *
 * All imported records: is_imported = true, imported_by = adminId.
 * System errors → full rollback, no partial save.
 * Valid rows imported, error rows skipped after user confirmation.
 */

import { db } from '@/lib/db'
import {
  flocks,
  dailyRecords,
  customers,
  inventoryMovements,
  coops,
  stockItems,
} from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import type { NewFlock, NewDailyRecord, NewCustomer, NewInventoryMovement } from '@/lib/db/schema'

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

// ─── Flock import ─────────────────────────────────────────────────────────────

export type FlockImportRow = Omit<NewFlock, 'isImported' | 'importedBy'>

/**
 * Expected CSV columns: coop_id, name, arrival_date, initial_count, breed (opt), notes (opt)
 */
export async function parseFlockscsv(csvText: string): Promise<ParseResult<FlockImportRow>> {
  const rows = parseCsv(csvText)
  const [, ...dataRows] = rows // skip header

  const valid: ParsedRow<FlockImportRow>[] = []
  const errors: ParseError[] = []

  for (const [idx, cols] of dataRows.entries()) {
    const rowNum = idx + 2
    const rowErrors: string[] = []

    const [coopId, name, arrivalDateStr, initialCountStr, breed, notes] = cols

    if (!coopId) {
      rowErrors.push(`Baris ${rowNum}: coop_id wajib diisi`)
    } else {
      const [coopRow] = await db.select({ id: coops.id }).from(coops).where(eq(coops.id, coopId)).limit(1)
      if (!coopRow) rowErrors.push(`Baris ${rowNum}: coop_id "${coopId}" tidak ditemukan`)
    }
    if (!name) rowErrors.push(`Baris ${rowNum}: name wajib diisi`)

    const { dateObj: arrivalDate, error: dateErr } = parseISODate(arrivalDateStr ?? '', 'arrival_date', rowNum)
    if (dateErr) rowErrors.push(dateErr)

    const { num: initialCount, error: countErr } = parseInt2(initialCountStr ?? '', 'initial_count', rowNum)
    if (countErr) rowErrors.push(countErr)
    if (initialCount !== undefined && initialCount <= 0) rowErrors.push(`Baris ${rowNum}: initial_count harus > 0`)

    if (rowErrors.length > 0) {
      errors.push({ rowNum, errors: rowErrors })
      continue
    }

    valid.push({
      rowNum,
      data: {
        coopId: coopId!,
        name: name!,
        arrivalDate: arrivalDate!,
        initialCount: initialCount!,
        breed: breed || null,
        notes: notes || null,
      },
    })
  }

  return { valid, errors }
}

// ─── DailyRecord import ───────────────────────────────────────────────────────

export type DailyRecordImportRow = Pick<NewDailyRecord, 'flockId' | 'recordDate' | 'deaths' | 'culled' | 'eggsCracked' | 'eggsAbnormal' | 'isLateInput'>

/**
 * Expected CSV columns: flock_id, record_date, deaths, culled, eggs_cracked (opt), eggs_abnormal (opt)
 * Note: egg/feed entries are imported separately via the daily input form.
 */
export async function parseDailyRecordsCsv(csvText: string): Promise<ParseResult<DailyRecordImportRow>> {
  const rows = parseCsv(csvText)
  const [, ...dataRows] = rows

  const valid: ParsedRow<DailyRecordImportRow>[] = []
  const errors: ParseError[] = []

  for (const [idx, cols] of dataRows.entries()) {
    const rowNum = idx + 2
    const rowErrors: string[] = []

    const [flockId, recordDateStr, deathsStr, culledStr, crackedStr, abnormalStr] = cols

    if (!flockId) {
      rowErrors.push(`Baris ${rowNum}: flock_id wajib diisi`)
    } else {
      const [flockRow] = await db.select({ id: flocks.id }).from(flocks).where(eq(flocks.id, flockId)).limit(1)
      if (!flockRow) rowErrors.push(`Baris ${rowNum}: flock_id "${flockId}" tidak ditemukan`)
    }

    const { date: recordDate, error: dateErr } = parseISODate(recordDateStr ?? '', 'record_date', rowNum)
    if (dateErr) rowErrors.push(dateErr)

    // Duplicate check: (flockId, recordDate) must not already exist
    if (flockId && recordDate && rowErrors.length === 0) {
      const [dup] = await db
        .select({ id: dailyRecords.id })
        .from(dailyRecords)
        .where(and(eq(dailyRecords.flockId, flockId), eq(dailyRecords.recordDate, recordDate)))
        .limit(1)
      if (dup) rowErrors.push(`Baris ${rowNum}: data untuk flock_id "${flockId}" pada tanggal ini sudah ada`)
    }

    const { num: deaths, error: e1 } = parseInt2(deathsStr ?? '', 'deaths', rowNum)
    if (e1) rowErrors.push(e1)
    const { num: culled, error: e2 } = parseInt2(culledStr ?? '', 'culled', rowNum)
    if (e2) rowErrors.push(e2)
    const { num: eggsCracked, error: e5 } = parseInt2(crackedStr ?? '', 'eggs_cracked', rowNum, false)
    if (e5) rowErrors.push(e5)
    const { num: eggsAbnormal, error: e6 } = parseInt2(abnormalStr ?? '', 'eggs_abnormal', rowNum, false)
    if (e6) rowErrors.push(e6)

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
        eggsCracked: eggsCracked ?? 0,
        eggsAbnormal: eggsAbnormal ?? 0,
        isLateInput: false,
      },
    })
  }

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

// ─── Opening stock import ─────────────────────────────────────────────────────

export type OpeningStockImportRow = Pick<NewInventoryMovement, 'stockItemId' | 'movementType' | 'source' | 'sourceType' | 'quantity' | 'movementDate'>

/**
 * Expected CSV columns: stock_item_id, quantity, movement_date
 */
export async function parseOpeningStockCsv(csvText: string): Promise<ParseResult<OpeningStockImportRow>> {
  const rows = parseCsv(csvText)
  const [, ...dataRows] = rows

  const valid: ParsedRow<OpeningStockImportRow>[] = []
  const errors: ParseError[] = []

  const checkedDates = new Set<string>()

  for (const [idx, cols] of dataRows.entries()) {
    const rowNum = idx + 2
    const rowErrors: string[] = []

    const [stockItemId, quantityStr, movementDateStr] = cols

    if (!stockItemId) {
      rowErrors.push(`Baris ${rowNum}: stock_item_id wajib diisi`)
    } else {
      const [itemRow] = await db.select({ id: stockItems.id }).from(stockItems).where(eq(stockItems.id, stockItemId)).limit(1)
      if (!itemRow) rowErrors.push(`Baris ${rowNum}: stock_item_id "${stockItemId}" tidak ditemukan`)
    }

    const { num: quantity, error: qErr } = parseInt2(quantityStr ?? '', 'quantity', rowNum)
    if (qErr) rowErrors.push(qErr)
    if (quantity !== undefined && quantity <= 0) rowErrors.push(`Baris ${rowNum}: quantity harus > 0`)

    const { date: movementDate, error: dErr } = parseISODate(movementDateStr ?? '', 'movement_date', rowNum)
    if (dErr) rowErrors.push(dErr)

    if (movementDate && !checkedDates.has(movementDate)) {
      checkedDates.add(movementDate)
      const [existing] = await db
        .select({ count: sql<string>`COUNT(*)` })
        .from(inventoryMovements)
        .where(
          and(
            eq(inventoryMovements.source, 'import'),
            eq(inventoryMovements.movementDate, movementDate)
          )
        )
      if (Number(existing?.count ?? 0) > 0) {
        rowErrors.push(`Baris ${rowNum}: import untuk tanggal "${movementDateStr}" sudah ada`)
      }
    }

    if (rowErrors.length > 0) {
      errors.push({ rowNum, errors: rowErrors })
      continue
    }

    valid.push({
      rowNum,
      data: {
        stockItemId: stockItemId!,
        movementType: 'in',
        source: 'import',
        sourceType: 'import',
        quantity: quantity!,
        movementDate: movementDate!,
      },
    })
  }

  return { valid, errors }
}

// ─── DB write ─────────────────────────────────────────────────────────────────

export type ImportEntity = 'flocks' | 'daily_records' | 'customers' | 'opening_stock'

export type ImportResult = {
  inserted: number
  skipped: number
}

/**
 * Writes valid parsed rows to DB inside a single transaction.
 * Any system error → full rollback.
 * admin-only: sets is_imported = true, imported_by = adminId.
 */
export async function commitImport(
  entity: ImportEntity,
  // any: dynamic row types across 4 entity types
  // any: row data varies by entity
  rows: ParsedRow<Record<string, unknown>>[],
  adminId: string
): Promise<ImportResult> {
  if (rows.length === 0) return { inserted: 0, skipped: 0 }

  return db.transaction(async (tx) => {
    let inserted = 0

    if (entity === 'flocks') {
      for (const row of rows) {
        await tx.insert(flocks).values({
          ...(row.data as NewFlock),
          isImported: true,
          importedBy: adminId,
          createdBy: adminId,
        })
        inserted++
      }
    } else if (entity === 'daily_records') {
      for (const row of rows) {
        await tx.insert(dailyRecords).values({
          ...(row.data as NewDailyRecord),
          isImported: true,
          importedBy: adminId,
          createdBy: adminId,
        })
        inserted++
      }
    } else if (entity === 'customers') {
      for (const row of rows) {
        await tx.insert(customers).values({
          ...(row.data as NewCustomer),
          isImported: true,
          importedBy: adminId,
          createdBy: adminId,
        })
        inserted++
      }
    } else if (entity === 'opening_stock') {
      for (const row of rows) {
        await tx.insert(inventoryMovements).values({
          ...(row.data as NewInventoryMovement),
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

const TEMPLATES: Record<ImportEntity, string> = {
  flocks: 'coop_id,name,arrival_date,initial_count,breed,notes\n',
  daily_records: 'flock_id,record_date,deaths,culled,eggs_cracked,eggs_abnormal\n',
  customers: 'name,type,phone,address,credit_limit,payment_terms\n',
  opening_stock: 'stock_item_id,quantity,movement_date\n',
}

export function getCsvTemplate(entity: ImportEntity): string {
  return TEMPLATES[entity]
}
