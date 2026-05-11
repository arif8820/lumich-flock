'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { requirePermission } from '@/lib/auth/guards'
import { PERMISSIONS } from '@/lib/auth/permissions'
import {
  listRoles,
  getRoleWithPermissions,
  createRole,
  updateRole,
  deleteRole,
  updatePermission,
  setAllPermissions,
} from '@/lib/services/role.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const createRoleSchema = z.object({
  name: z.string().min(1, 'Nama role tidak boleh kosong').max(50, 'Nama role maksimal 50 karakter'),
  displayName: z
    .string()
    .min(1, 'Display name tidak boleh kosong')
    .max(100, 'Display name maksimal 100 karakter'),
})

const updateRoleSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name tidak boleh kosong')
    .max(100, 'Display name maksimal 100 karakter'),
})

const updatePermissionSchema = z.object({
  roleId: z.string().min(1, 'Role ID tidak valid'),
  permissionKey: z.string().min(1, 'Permission key tidak valid'),
  granted: z.boolean(),
})

const setAllPermissionsSchema = z.object({
  roleId: z.string().min(1, 'Role ID tidak valid'),
  permissionKeys: z.array(z.string().min(1)).min(0),
})

export async function getRolesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listRoles>>>
> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  try {
    const roles = await listRoles(session.farmSchema)
    return { success: true, data: roles }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal memuat daftar role',
    }
  }
}

export async function getRoleWithPermissionsAction(
  roleId: string
): Promise<
  ActionResult<Awaited<ReturnType<typeof getRoleWithPermissions>>>
> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  try {
    const roleWithPermissions = await getRoleWithPermissions(session.farmSchema, roleId)
    if (!roleWithPermissions) {
      return { success: false, error: 'Role tidak ditemukan' }
    }
    return { success: true, data: roleWithPermissions }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal memuat role',
    }
  }
}

export async function createRoleAction(
  formData: unknown
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  const parsed = createRoleSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }

  try {
    const result = await createRole(session.farmSchema, parsed.data, session.id)
    return result as ActionResult
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal membuat role',
    }
  }
}

export async function updateRoleAction(
  roleId: string,
  formData: unknown
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  const parsed = updateRoleSchema.safeParse(formData)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }

  try {
    const result = await updateRole(session.farmSchema, roleId, parsed.data, session.id)
    return result as ActionResult
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal mengubah role',
    }
  }
}

export async function deleteRoleAction(roleId: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  try {
    const result = await deleteRole(session.farmSchema, roleId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    return { success: true, data: undefined }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal menghapus role',
    }
  }
}

export async function updatePermissionAction(
  roleId: string,
  permissionKey: string,
  granted: boolean
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  const parsed = updatePermissionSchema.safeParse({
    roleId,
    permissionKey,
    granted,
  })
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }

  try {
    const result = await updatePermission(
      session.farmSchema,
      roleId,
      permissionKey,
      granted,
      session.id
    )
    if (!result.success) {
      return { success: false, error: result.error }
    }
    return { success: true, data: undefined }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal mengubah permission',
    }
  }
}

export async function setAllPermissionsAction(
  roleId: string,
  permissionKeys: string[]
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  const denied = requirePermission(session, PERMISSIONS.ROLE.MANAGE)
  if (denied) return denied

  const parsed = setAllPermissionsSchema.safeParse({
    roleId,
    permissionKeys,
  })
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Input tidak valid',
    }
  }

  try {
    const result = await setAllPermissions(
      session.farmSchema,
      roleId,
      permissionKeys,
      session.id
    )
    if (!result.success) {
      return { success: false, error: result.error }
    }
    return { success: true, data: undefined }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Gagal mengatur permissions',
    }
  }
}
