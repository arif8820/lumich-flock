'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireAuth } from '@/lib/auth/guards'
import { saveDailyRecord, getFlockOptionsForInput } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function assertCoopAccess(userId: string, role: string, flockId: string): Promise<{ success: false; error: string } | null> {
  if (role !== 'operator') return null
  const flock = await findFlockById(flockId)
  if (!flock) return { success: false, error: 'Flock tidak ditemukan' }
  const assignedCoopIds = await findAssignedCoopIds(userId)
  if (!assignedCoopIds.includes(flock.coopId)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

const eggEntrySchema = z.object({
  stockItemId: z.string().uuid(),
  qtyButir: z.coerce.number().int().min(0),
  qtyKg: z.coerce.number().min(0),
})

const feedEntrySchema = z.object({
  stockItemId: z.string().uuid(),
  qtyUsed: z.coerce.number().min(0),
})

const saveDailyRecordSchema = z.object({
  flockId: z.string().uuid('Flock tidak valid'),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  deaths: z.coerce.number().int().min(0),
  culled: z.coerce.number().int().min(0),
  eggsCracked: z.coerce.number().int().min(0),
  eggsAbnormal: z.coerce.number().int().min(0),
  notes: z.string().max(500).optional(),
  eggEntries: z.array(eggEntrySchema).default([]),
  feedEntries: z.array(feedEntrySchema).default([]),
  vaccineEntries: z.array(feedEntrySchema).default([]),
})

export async function saveDailyRecordAction(
  data: unknown
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAuth()
  if (guard) return guard

  const session = await getSession()

  const parsed = saveDailyRecordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const coopGuard = await assertCoopAccess(session!.id, session!.role, parsed.data.flockId)
  if (coopGuard) return coopGuard

  try {
    const record = await saveDailyRecord(parsed.data, session!.id, session!.role)
    return { success: true, data: { id: record.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data produksi' }
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
