'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { correctDailyRecord } from '@/lib/services/lock-period.service'
import { findCorrectionsByEntity } from '@/lib/db/queries/correction-record.queries'
import type { CorrectionRecordWithUser } from '@/lib/db/queries/correction-record.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const correctionSchema = z.object({
  recordId: z.string().uuid(),
  reason: z.string().min(3, 'Alasan minimal 3 karakter'),
  deaths: z.coerce.number().int().min(0).optional(),
  culled: z.coerce.number().int().min(0).optional(),
  eggsCracked: z.coerce.number().int().min(0).optional(),
  eggsAbnormal: z.coerce.number().int().min(0).optional(),
})

export async function correctDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ count: number }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  if (session.role !== 'admin') return { success: false, error: 'Hanya admin yang dapat melakukan koreksi' }

  const parsed = correctionSchema.safeParse({
    recordId: formData.get('recordId'),
    reason: formData.get('reason'),
    deaths: formData.get('deaths') || undefined,
    culled: formData.get('culled') || undefined,
    eggsCracked: formData.get('eggsCracked') || undefined,
    eggsAbnormal: formData.get('eggsAbnormal') || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const { recordId, reason, ...patch } = parsed.data

  try {
    const corrections = await correctDailyRecord(recordId, patch, reason, session.id)
    return { success: true, data: { count: corrections.length } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan koreksi' }
  }
}

export async function getCorrectionHistoryAction(
  entityId: string
): Promise<ActionResult<CorrectionRecordWithUser[]>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const data = await findCorrectionsByEntity('daily_records', entityId)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat riwayat koreksi' }
  }
}
