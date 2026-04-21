'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import {
  createUser,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  changeUserPassword,
} from '@/lib/services/user.service'

const passwordSchema = z
  .string()
  .min(8, 'Minimal 8 karakter')
  .regex(/[A-Z]/, 'Harus ada huruf kapital')
  .regex(/[0-9]/, 'Harus ada angka')

const createUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['operator', 'supervisor', 'admin']),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

export async function createUserAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()
  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const user = await createUser({ ...parsed.data, createdBy: session!.id })
    return { success: true, data: { id: user.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat user' }
  }
}

export async function updateUserRoleAction(
  userId: string,
  role: 'operator' | 'supervisor' | 'admin'
): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    await updateUserRole(userId, role)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah role' }
  }
}

export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    await deactivateUser(userId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menonaktifkan user' }
  }
}

export async function activateUserAction(userId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    await activateUser(userId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengaktifkan user' }
  }
}

export async function changeUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const parsed = passwordSchema.safeParse(newPassword)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Password tidak valid' }
  }

  try {
    await changeUserPassword(userId, newPassword)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah password' }
  }
}

export async function getUsersAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllUsers>>>> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const users = await getAllUsers()
    return { success: true, data: users }
  } catch {
    return { success: false, error: 'Gagal memuat daftar user' }
  }
}
