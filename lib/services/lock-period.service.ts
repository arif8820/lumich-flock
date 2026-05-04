/**
 * Lock Period Service — Sprint 8
 * Enforces edit windows per role and creates correction_records for admin edits past lock.
 *
 * Rules (from PRD Section 6.5):
 *   Operator  → H+1 from record_date
 *   Supervisor→ H+7 from record_date
 *   Admin     → unlimited
 *
 * When admin edits a locked record → must supply reason → creates correction_record.
 * Old value is preserved; no overwrite without audit trail.
 */

import { db } from '@/lib/db'
import { dailyRecords } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { insertCorrectionRecord } from '@/lib/db/queries/correction-record.queries'
import type { CorrectionRecord } from '@/lib/db/schema'

type Role = 'operator' | 'supervisor' | 'admin'

/**
 * Returns true if the given role can edit a record with the given record_date at `now`.
 */
export function canEdit(recordDate: Date, role: Role, now: Date = new Date()): boolean {
  if (role === 'admin') return true

  const recDay = Date.UTC(recordDate.getUTCFullYear(), recordDate.getUTCMonth(), recordDate.getUTCDate())
  const nowDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const diffDays = Math.round((nowDay - recDay) / 86_400_000)

  const limit = role === 'operator' ? 1 : 7 // supervisor = H+7
  return diffDays <= limit
}

/**
 * Throws if the role cannot edit this record date.
 * Admin always passes (no throw).
 */
export function assertCanEdit(recordDate: Date, role: Role, now: Date = new Date()): void {
  if (canEdit(recordDate, role, now)) return
  const limit = role === 'operator' ? 'H+1' : 'H+7'
  throw new Error(`Role ${role} hanya dapat mengedit data sampai ${limit} dari tanggal record`)
}

/**
 * Checks whether a record is in a locked state for a given role.
 * Admins editing a locked record must supply a reason and the result will
 * create correction_records.
 */
export function isLocked(recordDate: Date, role: Role, now: Date = new Date()): boolean {
  return !canEdit(recordDate, role, now)
}

// ─── daily_record correction ──────────────────────────────────────────────────

type DailyRecordPatch = {
  deaths?: number
  culled?: number
  eggsCracked?: number
  eggsAbnormal?: number
}

/**
 * Admin-only: apply corrections to a daily_record past lock window.
 * Creates one correction_record per changed field.
 * Egg/feed/vaccine corrections are handled via new input entries in the sub-tables;
 * this service only patches the core daily_record fields.
 */
export async function correctDailyRecord(
  recordId: string,
  patch: DailyRecordPatch,
  reason: string,
  adminId: string
): Promise<CorrectionRecord[]> {
  if (!reason || reason.trim().length === 0) {
    throw new Error('Alasan koreksi wajib diisi')
  }

  const [existing] = await db
    .select()
    .from(dailyRecords)
    .where(eq(dailyRecords.id, recordId))
    .limit(1)

  if (!existing) throw new Error('Data harian tidak ditemukan')

  const changedFields = (Object.keys(patch) as (keyof DailyRecordPatch)[]).filter(
    (k) => patch[k] !== undefined && String(patch[k]) !== String((existing as Record<string, unknown>)[k] ?? '')
  )

  if (changedFields.length === 0) throw new Error('Tidak ada perubahan data')

  return db.transaction(async (tx) => {
    const corrections: CorrectionRecord[] = []

    for (const field of changedFields) {
      const oldVal = String((existing as Record<string, unknown>)[field] ?? '')
      const newVal = String(patch[field] ?? '')

      const rec = await insertCorrectionRecord({
        entityType: 'daily_records',
        entityId: recordId,
        fieldName: field,
        oldValue: oldVal,
        newValue: newVal,
        reason: reason.trim(),
        correctedBy: adminId,
      }, tx)
      corrections.push(rec)
    }

    // Build update set
    const updateSet: Record<string, unknown> = { updatedBy: adminId }
    for (const field of changedFields) {
      const val = patch[field]
      updateSet[field] = val != null ? String(val) : null
    }
    await tx.update(dailyRecords).set(updateSet).where(eq(dailyRecords.id, recordId))

    return corrections
  })
}
