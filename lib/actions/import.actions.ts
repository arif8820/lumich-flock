'use server'

import { getSession } from '@/lib/auth/get-session'
import { requireAdmin } from '@/lib/auth/guards'
import {
  parseDailyRecordsCsv,
  parseCustomersCsv,
  commitImport,
  getCsvTemplate,
  generateDailyRecordsCsvTemplate,
} from '@/lib/services/import.service'
import type { ImportEntity, ParseResult, ParsedRow, ImportResult } from '@/lib/services/import.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function parseCsvAction(
  entity: ImportEntity,
  csvText: string
  // any: ParseResult generic varies by entity
): Promise<ActionResult<ParseResult<Record<string, unknown>>>> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()
  if (!session) return { success: false, error: 'Sesi tidak ditemukan' }

  try {
    let result
    if (entity === 'daily_records') result = await parseDailyRecordsCsv(csvText, session.farmSchema)
    else result = parseCustomersCsv(csvText)

    return {
      success: true,
      // any: cast for unified return type
      data: result as ParseResult<Record<string, unknown>>,
    }
  } catch {
    return { success: false, error: 'Gagal memproses file CSV' }
  }
}

export async function commitImportAction(
  entity: ImportEntity,
  // any: parsed rows from dynamic parse step
  rows: ParsedRow<Record<string, unknown>>[]
): Promise<ActionResult<ImportResult>> {
  const guard = await requireAdmin()
  if (guard) return guard

  // requireAdmin() already confirmed session exists — getSession() is safe
  const session = await getSession()
  if (!session) return { success: false, error: 'Sesi tidak ditemukan' }

  try {
    const result = await commitImport(entity, rows, session.id, session.farmSchema)
    return { success: true, data: result }
  } catch (e) {
    // Drizzle wraps errors from db.transaction() — walk cause chain for the postgres error
    let err: unknown = e
    while (err instanceof Error) {
      if (err.message.includes('daily_records_flock_date_idx')) {
        return { success: false, error: 'Data untuk flock pada tanggal tersebut sudah ada' }
      }
      err = err.cause
    }
    return { success: false, error: 'Gagal mengimpor data — semua perubahan dibatalkan' }
  }
}

export async function getCsvTemplateAction(
  entity: ImportEntity
): Promise<ActionResult<string>> {
  const guard = await requireAdmin()
  if (guard) return guard

  if (entity === 'daily_records') {
    const session = await getSession()
    if (!session) return { success: false, error: 'Sesi tidak ditemukan' }
    const template = await generateDailyRecordsCsvTemplate(session.farmSchema)
    return { success: true, data: template }
  }

  return { success: true, data: getCsvTemplate(entity) }
}
