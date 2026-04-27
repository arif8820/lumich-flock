'use server'

import { getSession } from '@/lib/auth/get-session'
import {
  parseFlockscsv,
  parseDailyRecordsCsv,
  parseCustomersCsv,
  parseOpeningStockCsv,
  commitImport,
  getCsvTemplate,
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
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  if (session.role !== 'admin') return { success: false, error: 'Hanya admin yang dapat mengimpor data' }

  try {
    let result
    if (entity === 'flocks') result = parseFlockscsv(csvText)
    else if (entity === 'daily_records') result = parseDailyRecordsCsv(csvText)
    else if (entity === 'customers') result = parseCustomersCsv(csvText)
    else result = parseOpeningStockCsv(csvText)

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
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  if (session.role !== 'admin') return { success: false, error: 'Hanya admin yang dapat mengimpor data' }

  try {
    const result = await commitImport(entity, rows, session.id)
    return { success: true, data: result }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal mengimpor data — semua perubahan dibatalkan',
    }
  }
}

export async function getCsvTemplateAction(
  entity: ImportEntity
): Promise<ActionResult<string>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  if (session.role !== 'admin') return { success: false, error: 'Hanya admin yang dapat mengakses template' }

  return { success: true, data: getCsvTemplate(entity) }
}
