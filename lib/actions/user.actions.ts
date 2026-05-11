'use server'

import { z } from 'zod'
import { getRequiredSession, requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  createUser,
  getAllUsers,
  getAllRoles,
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
  fullName: z.string().min(2, 'Nama minimal 2 karakter').max(500).trim(),
  roleId: z.string().uuid('Role tidak valid'),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createUserAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
    roleId: formData.get('roleId'),
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const user = await createUser(session.farmSchema, { ...parsed.data, createdBy: session.id })
    return { success: true, data: { id: user.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat user' }
  }
}

export async function updateUserRoleAction(
  userId: string,
  roleId: string
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

  try {
    await updateUserRole(session.farmSchema, userId, roleId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengubah role' }
  }
}

export async function getAllRolesAction(): Promise<ActionResult<Awaited<ReturnType<typeof getAllRoles>>>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

  try {
    const roles = await getAllRoles(session.farmSchema)
    return { success: true, data: roles }
  } catch {
    return { success: false, error: 'Gagal memuat daftar role' }
  }
}

export async function deactivateUserAction(userId: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

  try {
    await deactivateUser(session.farmSchema, userId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal menonaktifkan user' }
  }
}

export async function activateUserAction(userId: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

  try {
    await activateUser(session.farmSchema, userId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal mengaktifkan user' }
  }
}

export async function changeUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

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
  const session = await getRequiredSession()
  if ('error' in session) return session
  const denied = requirePermission(session, PERMISSIONS.USER.MANAGE)
  if (denied) return denied

  try {
    const users = await getAllUsers(session.farmSchema)
    return { success: true, data: users }
  } catch {
    return { success: false, error: 'Gagal memuat daftar user' }
  }
}
