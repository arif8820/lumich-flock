import { revalidateTag } from 'next/cache'
import {
  getRoles,
  getRoleById,
  getRolePermissions,
  getRoleUserCount,
  createRoleQuery,
  updateRoleQuery,
  deleteRoleQuery,
  upsertRolePermission,
  deleteRolePermission,
  deleteAllRolePermissions,
} from '@/lib/db/queries/roles.queries'

const SLUG_REGEX = /^[a-z][a-z0-9_]{0,50}$/

export async function listRoles(farmSchema: string) {
  return getRoles(farmSchema)
}

export async function getRoleWithPermissions(
  farmSchema: string,
  roleId: string
): Promise<{ role: Awaited<ReturnType<typeof getRoleById>>; permissions: string[] } | null> {
  const role = await getRoleById(farmSchema, roleId)
  if (!role) return null
  const permissions = await getRolePermissions(farmSchema, roleId)
  return { role, permissions }
}

type CreateRoleInput = { name: string; displayName: string }
type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }
type ServiceVoidResult = { success: true } | { success: false; error: string }

export async function createRole(
  farmSchema: string,
  data: CreateRoleInput,
  actorId: string
): Promise<ServiceResult<Awaited<ReturnType<typeof createRoleQuery>>>> {
  try {
    if (!SLUG_REGEX.test(data.name)) {
      return {
        success: false,
        error: 'Nama role harus berformat slug (huruf kecil, angka, underscore)',
      }
    }
    if (!data.displayName.trim()) {
      return { success: false, error: 'Display name tidak boleh kosong' }
    }
    const role = await createRoleQuery(farmSchema, {
      name: data.name,
      displayName: data.displayName,
      createdBy: actorId,
    })
    return { success: true, data: role }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat role'
    return { success: false, error: message }
  }
}

export async function updateRole(
  farmSchema: string,
  roleId: string,
  data: { displayName: string },
  // actorId reserved for future audit trail
  _actorId: string
): Promise<ServiceResult<NonNullable<Awaited<ReturnType<typeof updateRoleQuery>>>>> {
  try {
    const role = await getRoleById(farmSchema, roleId)
    if (!role) return { success: false, error: 'Role tidak ditemukan' }
    if (role.isSystem) return { success: false, error: 'Role sistem tidak dapat diubah' }
    if (!data.displayName.trim()) {
      return { success: false, error: 'Display name tidak boleh kosong' }
    }
    const updated = await updateRoleQuery(farmSchema, roleId, { displayName: data.displayName })
    if (!updated) return { success: false, error: 'Role tidak ditemukan' }
    return { success: true, data: updated }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah role'
    return { success: false, error: message }
  }
}

export async function deleteRole(
  farmSchema: string,
  roleId: string
): Promise<ServiceVoidResult> {
  try {
    const role = await getRoleById(farmSchema, roleId)
    if (!role) return { success: false, error: 'Role tidak ditemukan' }
    if (role.isSystem) return { success: false, error: 'Role sistem tidak dapat diubah' }
    const userCount = await getRoleUserCount(farmSchema, roleId)
    if (userCount > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus role yang masih digunakan oleh ${userCount} user`,
      }
    }
    await deleteRoleQuery(farmSchema, roleId)
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus role'
    return { success: false, error: message }
  }
}

export async function updatePermission(
  farmSchema: string,
  roleId: string,
  permissionKey: string,
  granted: boolean,
  actorId: string
): Promise<ServiceVoidResult> {
  try {
    const role = await getRoleById(farmSchema, roleId)
    if (!role) return { success: false, error: 'Role tidak ditemukan' }
    if (role.isSystem) return { success: false, error: 'Role sistem tidak dapat diubah' }
    if (granted) {
      await upsertRolePermission(farmSchema, roleId, permissionKey, actorId)
    } else {
      await deleteRolePermission(farmSchema, roleId, permissionKey)
    }
    revalidateTag('role-permissions')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah permission'
    return { success: false, error: message }
  }
}

export async function setAllPermissions(
  farmSchema: string,
  roleId: string,
  permissionKeys: string[],
  actorId: string
): Promise<ServiceVoidResult> {
  try {
    const role = await getRoleById(farmSchema, roleId)
    if (!role) return { success: false, error: 'Role tidak ditemukan' }
    if (role.isSystem) return { success: false, error: 'Role sistem tidak dapat diubah' }
    await deleteAllRolePermissions(farmSchema, roleId)
    for (const key of permissionKeys) {
      await upsertRolePermission(farmSchema, roleId, key, actorId)
    }
    revalidateTag('role-permissions')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengatur permissions'
    return { success: false, error: message }
  }
}
