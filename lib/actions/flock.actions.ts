'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
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

async function requireSupervisorOrAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await getSession()
  if (!session || session.role === 'operator') return { success: false, error: 'Akses ditolak' }
  return null
}

export async function createFlockAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session || session.role === 'operator') return { success: false, error: 'Akses ditolak' }

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
    const flock = await createFlock({ ...parsed.data, createdBy: session.id })
    return { success: true, data: { id: flock.id } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal membuat flock'
    return { success: false, error: msg }
  }
}

export async function retireFlockAction(flockId: string): Promise<ActionResult> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await retireFlock(flockId, session.id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menutup flock' }
  }
}

export async function getActiveFlocksAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllActiveFlocks>>>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const flocks = await getAllActiveFlocks()
    return { success: true, data: flocks }
  } catch {
    return { success: false, error: 'Gagal memuat daftar flock' }
  }
}
