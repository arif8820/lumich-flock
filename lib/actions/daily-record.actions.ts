'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { saveDailyRecord, getFlockOptionsForInput, type Role } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function assertCoopAccess(farmSchema: string, userId: string, role: string, flockId: string): Promise<{ success: false; error: string } | null> {
  if (role !== 'operator') return null
  const flock = await findFlockById(farmSchema, flockId)
  if (!flock) return { success: false, error: 'Flock tidak ditemukan' }
  const assignedCoopIds = await findAssignedCoopIds(farmSchema, userId)
  if (!assignedCoopIds.includes(flock.coopId)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

const bundleEntrySchema = z.object({
  trayCount: z.coerce.number().int().min(1),
  topTrayCount: z.coerce.number().int().min(0).max(30),
  qtyKg: z.coerce.number().min(0),
})

const eggEntrySchema = z.object({
  stockItemId: z.string().uuid(),
  useBundleMethod: z.coerce.boolean().default(false),
  qtyButir: z.coerce.number().int().min(0).optional(),
  qtyKg: z.coerce.number().min(0).optional(),
  bundles: z.array(bundleEntrySchema).optional(),
}).refine(
  (v) => {
    if (v.useBundleMethod) return v.bundles && v.bundles.length > 0
    return v.qtyButir !== undefined
  },
  { message: 'Item tray wajib ada minimal 1 ikatan; item biasa wajib ada qtyButir' }
)

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
  const session = await getRequiredSession()
  if ('error' in session) return session

  const parsed = saveDailyRecordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const coopGuard = await assertCoopAccess(session.farmSchema, session.id, session.roleSlug as Role, parsed.data.flockId)
  if (coopGuard) return coopGuard

  try {
    const record = await saveDailyRecord(session.farmSchema, parsed.data, session.id, session.roleSlug as Role)
    return { success: true, data: { id: record.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan data produksi' }
  }
}

export type { FlockOption } from '@/lib/services/daily-record.service'

export async function getFlockOptionsForInputAction(): Promise<ActionResult<import('@/lib/services/daily-record.service').FlockOption[]>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    const data = await getFlockOptionsForInput(session.farmSchema, session.id, session.roleSlug as Role)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
