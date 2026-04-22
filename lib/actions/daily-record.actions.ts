'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { createDailyRecord, getFlockOptionsForInput } from '@/lib/services/daily-record.service'

const dailyRecordSchema = z.object({
  flockId: z.string().uuid('Flock tidak valid'),
  recordDate: z.coerce.date(),
  deaths: z.coerce.number().int().min(0),
  culled: z.coerce.number().int().min(0),
  eggsGradeA: z.coerce.number().int().min(0),
  eggsGradeB: z.coerce.number().int().min(0),
  eggsCracked: z.coerce.number().int().min(0),
  eggsAbnormal: z.coerce.number().int().min(0),
  avgWeightKg: z.coerce.number().optional(),
  feedKg: z.coerce.number().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = dailyRecordSchema.safeParse({
    flockId: formData.get('flockId'),
    recordDate: formData.get('recordDate'),
    deaths: formData.get('deaths'),
    culled: formData.get('culled'),
    eggsGradeA: formData.get('eggsGradeA'),
    eggsGradeB: formData.get('eggsGradeB'),
    eggsCracked: formData.get('eggsCracked'),
    eggsAbnormal: formData.get('eggsAbnormal'),
    avgWeightKg: formData.get('avgWeightKg') || undefined,
    feedKg: formData.get('feedKg') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const record = await createDailyRecord(parsed.data, session.id, session.role)
    return { success: true, data: { id: record.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data produksi' }
  }
}

export type { FlockOption } from '@/lib/services/daily-record.service'

export async function getFlockOptionsForInputAction(): Promise<ActionResult<import('@/lib/services/daily-record.service').FlockOption[]>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const data = await getFlockOptionsForInput(session.id, session.role)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
