'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { saveDailyRecord, saveSingleBundle, deleteBundle, getExistingBundlesForInput, getFlockOptionsForInput, addBundleContribution, getOpenBundlesForCarryOver, type Role } from '@/lib/services/daily-record.service'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'
import { findDailyRecord, findDailySubRecordsByRecordId } from '@/lib/db/queries/daily-record.queries'

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

const saveBundleSchema = z.object({
  flockId: z.string().uuid(),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stockItemId: z.string().uuid(),
  trayCount: z.coerce.number().int().min(1),
  topTrayCount: z.coerce.number().int().min(0).max(30),
  qtyKg: z.coerce.number().min(0.01, 'Kg harus lebih dari 0'),
})

export async function saveBundleAction(
  data: unknown
): Promise<ActionResult<{ bundleCode: string; bundleIndex: number; qtyButir: number; qtyKg: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const parsed = saveBundleSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const coopGuard = await assertCoopAccess(session.farmSchema, session.id, session.roleSlug as Role, parsed.data.flockId)
  if (coopGuard) return coopGuard

  try {
    const result = await saveSingleBundle(session.farmSchema, parsed.data, session.id, session.roleSlug as Role)
    return { success: true, data: result }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan ikatan' }
  }
}

export async function deleteBundleAction(
  bundleId: string
): Promise<ActionResult<void>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    await deleteBundle(session.farmSchema, bundleId, session.id, session.roleSlug as Role)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menghapus ikatan' }
  }
}

export async function getExistingBundlesForInputAction(
  flockId: string,
  recordDate: string
): Promise<ActionResult<Record<string, import('@/lib/services/daily-record.service').BundleWithStockItem[]>>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const coopGuard = await assertCoopAccess(session.farmSchema, session.id, session.roleSlug as Role, flockId)
  if (coopGuard) return coopGuard

  try {
    const data = await getExistingBundlesForInput(session.farmSchema, flockId, recordDate)
    return { success: true, data }
  } catch {
    return { success: false, error: 'Gagal memuat daftar ikatan' }
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

const addBundleContributionSchema = z.object({
  bundleId: z.string().uuid(),
  recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  originalRecordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  stockItemId: z.string().uuid(),
  flockId: z.string().uuid(),
  trayCount: z.coerce.number().int().min(1, 'Nampan harus ≥ 1'),
  topTrayCount: z.coerce.number().int().min(0).max(30),
  qtyKg: z.coerce.number().min(0.01, 'Total kg harus lebih dari 0'),
})

export async function addBundleContributionAction(data: {
  bundleId: string
  recordDate: string
  originalRecordDate: string
  stockItemId: string
  flockId: string
  trayCount: number
  topTrayCount: number
  qtyKg: number
}): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const parsed = addBundleContributionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  const coopGuard = await assertCoopAccess(session.farmSchema, session.id, session.roleSlug as Role, parsed.data.flockId)
  if (coopGuard) return coopGuard

  return addBundleContribution(session.farmSchema, parsed.data, session.id, session.roleSlug as Role)
}

export async function getOpenBundlesForCarryOverAction(
  flockId: string,
  inputDate: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  return getOpenBundlesForCarryOver(session.farmSchema, flockId, inputDate)
}

export type ExistingRecordData = {
  id: string
  deaths: number
  culled: number
  eggsCracked: number
  eggsAbnormal: number
  notes: string | null
  eggEntries: { stockItemId: string; qtyButir: number; qtyKg: number }[]
  feedEntries: { stockItemId: string; qtyUsed: number }[]
  vaccineEntries: { stockItemId: string; qtyUsed: number }[]
}

export async function getExistingDailyRecordAction(
  flockId: string,
  recordDate: string
): Promise<ActionResult<ExistingRecordData | null>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    const record = await findDailyRecord(session.farmSchema, flockId, recordDate)
    if (!record) return { success: true, data: null }

    const subRecords = await findDailySubRecordsByRecordId(session.farmSchema, record.id)
    return {
      success: true,
      data: {
        id: record.id,
        deaths: record.deaths,
        culled: record.culled,
        eggsCracked: record.eggsCracked,
        eggsAbnormal: record.eggsAbnormal,
        notes: record.notes,
        eggEntries: subRecords.eggRecords,
        feedEntries: subRecords.feedRecords,
        vaccineEntries: subRecords.vaccineRecords,
      },
    }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat data produksi' }
  }
}
