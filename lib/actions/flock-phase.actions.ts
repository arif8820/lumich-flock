'use server'

import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createFlockPhase,
  updateFlockPhaseById,
  deleteFlockPhaseById,
} from '@/lib/services/flock-phase.service'
import { revalidateTag } from 'next/cache'

const flockPhaseSchema = z.object({
  name: z.string().min(1, 'Nama fase wajib diisi'),
  minWeeks: z.coerce.number().int().min(0),
  maxWeeks: z.coerce.number().int().positive().optional(),
  sortOrder: z.coerce.number().int().positive(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createFlockPhaseAction(formData: FormData): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.FLOCK.UPDATE)
  if (denied) return denied

  const parsed = flockPhaseSchema.safeParse({
    name: formData.get('name'),
    minWeeks: formData.get('minWeeks'),
    maxWeeks: formData.get('maxWeeks') || undefined,
    sortOrder: formData.get('sortOrder'),
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    await createFlockPhase(session.farmSchema, parsed.data)
    revalidateTag('flock-phases')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal membuat fase' }
  }
}

export async function updateFlockPhaseAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.FLOCK.UPDATE)
  if (denied) return denied

  const parsed = flockPhaseSchema.safeParse({
    name: formData.get('name'),
    minWeeks: formData.get('minWeeks'),
    maxWeeks: formData.get('maxWeeks') || undefined,
    sortOrder: formData.get('sortOrder'),
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    await updateFlockPhaseById(session.farmSchema, id, parsed.data)
    revalidateTag('flock-phases')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah fase' }
  }
}

export async function deleteFlockPhaseAction(id: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.FLOCK.UPDATE)
  if (denied) return denied

  try {
    await deleteFlockPhaseById(session.farmSchema, id)
    revalidateTag('flock-phases')
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menghapus fase' }
  }
}
