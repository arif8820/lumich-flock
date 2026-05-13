'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { updateInfoAkunService, gantiPasswordService } from '@/lib/services/profil.service'

const infoAkunSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(500).trim(),
  phone: z.string().max(20).trim().optional(),
})

const gantiPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function updateInfoAkunAction(
  formData: FormData
): Promise<ActionResult<{ fullName: string; phone: string | null }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const parsed = infoAkunSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone') || undefined,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const updated = await updateInfoAkunService(session.farmSchema, session.id, {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
    })
    return { success: true, data: updated }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memperbarui akun' }
  }
}

export async function gantiPasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const parsed = gantiPasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    await gantiPasswordService(session.email, parsed.data.currentPassword, parsed.data.newPassword, session.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal mengubah password' }
  }
}
