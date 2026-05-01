'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAuth } from '@/lib/auth/guards'
import { createDailyRecord, getFlockOptionsForInput, updateDailyRecord } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'

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

async function assertCoopAccess(userId: string, role: string, flockId: string): Promise<{ success: false; error: string } | null> {
  if (role !== 'operator') return null // supervisor + admin can access all coops
  const flock = await findFlockById(flockId)
  if (!flock) return { success: false, error: 'Flock tidak ditemukan' }
  const assignedCoopIds = await findAssignedCoopIds(userId)
  if (!assignedCoopIds.includes(flock.coopId)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

export async function createDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

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

  const coopGuard = await assertCoopAccess(session!.id, session!.role, parsed.data.flockId)
  if (coopGuard) return coopGuard

  try {
    const record = await createDailyRecord(parsed.data, session!.id, session!.role)
    return { success: true, data: { id: record.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data produksi' }
  }
}

const updateDailyRecordSchema = z.object({
  recordId: z.string().uuid(),
  flockId: z.string().uuid().optional(), // needed for coop scope check
  deaths: z.coerce.number().int().min(0).optional(),
  culled: z.coerce.number().int().min(0).optional(),
  eggsGradeA: z.coerce.number().int().min(0).optional(),
  eggsGradeB: z.coerce.number().int().min(0).optional(),
  eggsCracked: z.coerce.number().int().min(0).optional(),
  eggsAbnormal: z.coerce.number().int().min(0).optional(),
  avgWeightKg: z.coerce.number().optional(),
  feedKg: z.coerce.number().optional(),
})

export async function updateDailyRecordAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

  const parsed = updateDailyRecordSchema.safeParse({
    recordId: formData.get('recordId'),
    flockId: formData.get('flockId') || undefined,
    deaths: formData.get('deaths') || undefined,
    culled: formData.get('culled') || undefined,
    eggsGradeA: formData.get('eggsGradeA') || undefined,
    eggsGradeB: formData.get('eggsGradeB') || undefined,
    eggsCracked: formData.get('eggsCracked') || undefined,
    eggsAbnormal: formData.get('eggsAbnormal') || undefined,
    avgWeightKg: formData.get('avgWeightKg') || undefined,
    feedKg: formData.get('feedKg') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  if (parsed.data.flockId) {
    const coopGuard = await assertCoopAccess(session!.id, session!.role, parsed.data.flockId)
    if (coopGuard) return coopGuard
  }

  const { recordId, flockId: _flockId, ...patch } = parsed.data

  try {
    const updated = await updateDailyRecord(recordId, patch, session!.id, session!.role)
    return { success: true, data: { id: updated.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data' }
  }
}

export type { FlockOption } from '@/lib/services/daily-record.service'

export async function getFlockOptionsForInputAction(): Promise<ActionResult<import('@/lib/services/daily-record.service').FlockOption[]>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

  try {
    const data = await getFlockOptionsForInput(session!.id, session!.role)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
