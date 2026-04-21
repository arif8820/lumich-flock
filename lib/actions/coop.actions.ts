'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { createCoop, getAllCoops, updateCoop, deactivateCoop } from '@/lib/services/coop.service'

const coopSchema = z.object({
  name: z.string().min(1, 'Nama kandang wajib diisi'),
  capacity: z.coerce.number().int().positive().optional(),
  notes: z.string().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Akses ditolak' }
  return null
}

export async function createCoopAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin()
  if (guard) return guard

  const parsed = coopSchema.safeParse({
    name: formData.get('name'),
    capacity: formData.get('capacity') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const coop = await createCoop(parsed.data)
    return { success: true, data: { id: coop.id } }
  } catch {
    return { success: false, error: 'Gagal membuat kandang. Nama mungkin sudah digunakan.' }
  }
}

export async function updateCoopAction(id: string, formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const parsed = coopSchema.safeParse({
    name: formData.get('name'),
    capacity: formData.get('capacity') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    await updateCoop(id, parsed.data)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah kandang' }
  }
}

export async function deactivateCoopAction(id: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  try {
    await deactivateCoop(id)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menonaktifkan kandang' }
  }
}

export async function getCoopsAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllCoops>>>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  try {
    const coops = await getAllCoops()
    return { success: true, data: coops }
  } catch {
    return { success: false, error: 'Gagal memuat daftar kandang' }
  }
}
