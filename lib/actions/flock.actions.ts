'use server'

import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  getAllActiveFlocks,
  createFlock,
  retireFlock,
} from '@/lib/services/flock.service'

const flockSchema = z.object({
  coopId: z.string().uuid('Kandang tidak valid'),
  name: z.string().min(1, 'Nama flock wajib diisi'),
  arrivalDate: z.coerce.date(),
  firstDeliveryDate: z.coerce.date(),
  firstDeliveryQuantity: z.coerce.number().int().positive('Jumlah DOC harus positif'),
  ageAtArrivalDays: z.coerce.number().int().nonnegative().optional(),
  breed: z.string().optional(),
  notes: z.string().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }


export async function createFlockAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.FLOCK.CREATE)
  if (denied) return denied

  const parsed = flockSchema.safeParse({
    coopId: formData.get('coopId'),
    name: formData.get('name'),
    arrivalDate: formData.get('arrivalDate'),
    firstDeliveryDate: formData.get('firstDeliveryDate'),
    firstDeliveryQuantity: formData.get('firstDeliveryQuantity'),
    ageAtArrivalDays: formData.get('ageAtArrivalDays') || undefined,
    breed: formData.get('breed') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const flock = await createFlock(session.farmSchema, { ...parsed.data, createdBy: session.id })
    return { success: true, data: { id: flock.id } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal membuat flock'
    return { success: false, error: msg }
  }
}

export async function retireFlockAction(flockId: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.FLOCK.DELETE)
  if (denied) return denied

  try {
    await retireFlock(session.farmSchema, flockId, session.id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menutup flock' }
  }
}

export async function getActiveFlocksAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllActiveFlocks>>>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    const flocks = await getAllActiveFlocks(session.farmSchema)
    return { success: true, data: flocks }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
