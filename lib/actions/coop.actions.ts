'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { createCoop, getAllCoops, updateCoop, deactivateCoop, activateCoop } from '@/lib/services/coop.service'

const coopSchema = z.object({
  name: z.string().min(1, 'Nama kandang wajib diisi').max(500).trim(),
  capacity: z.coerce.number().int().positive().optional(),
  notes: z.string().max(500).trim().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createCoopAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = coopSchema.safeParse({
    name: formData.get('name'),
    capacity: formData.get('capacity') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const coop = await createCoop(session.farmSchema, parsed.data)
    return { success: true, data: { id: coop.id } }
  } catch {
    return { success: false, error: 'Gagal membuat kandang. Nama mungkin sudah digunakan.' }
  }
}

export async function updateCoopAction(id: string, formData: FormData): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = coopSchema.safeParse({
    name: formData.get('name'),
    capacity: formData.get('capacity') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    await updateCoop(session.farmSchema, id, parsed.data)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah kandang' }
  }
}

export async function deactivateCoopAction(id: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }
  try {
    await deactivateCoop(session.farmSchema, id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menonaktifkan kandang' }
  }
}

export async function activateCoopAction(id: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }
  try {
    await activateCoop(session.farmSchema, id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengaktifkan kandang' }
  }
}

export async function getCoopsAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllCoops>>>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  try {
    const coops = await getAllCoops(session.farmSchema)
    return { success: true, data: coops }
  } catch {
    return { success: false, error: 'Gagal memuat daftar kandang' }
  }
}
