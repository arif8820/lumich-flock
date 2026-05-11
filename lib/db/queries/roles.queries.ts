import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, asc, count } from 'drizzle-orm'

export async function getRoles(farmSchema: string) {
  const { roles } = getFarmSchema(farmSchema)
  return db
    .select({
      id: roles.id,
      name: roles.name,
      displayName: roles.displayName,
      isSystem: roles.isSystem,
      isActive: roles.isActive,
      createdAt: roles.createdAt,
    })
    .from(roles)
    .orderBy(desc(roles.isSystem), asc(roles.name))
}

export async function getRoleById(farmSchema: string, roleId: string) {
  const { roles } = getFarmSchema(farmSchema)
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1)
  return role ?? null
}

export async function getRolePermissions(farmSchema: string, roleId: string): Promise<string[]> {
  const { rolePermissions } = getFarmSchema(farmSchema)
  const rows = await db
    .select({ permissionKey: rolePermissions.permissionKey })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleId, roleId))
  return rows.map((r) => r.permissionKey)
}

export async function getUserRolePermissions(
  farmSchema: string,
  userId: string
): Promise<{ permissionKey: string }[]> {
  const { users, rolePermissions } = getFarmSchema(farmSchema)
  return db
    .select({ permissionKey: rolePermissions.permissionKey })
    .from(users)
    .innerJoin(rolePermissions, eq(users.roleId, rolePermissions.roleId))
    .where(eq(users.id, userId))
}

export async function getRoleUserCount(farmSchema: string, roleId: string): Promise<number> {
  const { users } = getFarmSchema(farmSchema)
  const [result] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.roleId, roleId))
  return result?.count ?? 0
}

export async function createRoleQuery(
  farmSchema: string,
  data: { name: string; displayName: string; createdBy: string }
) {
  const { roles } = getFarmSchema(farmSchema)
  const [role] = await db
    .insert(roles)
    .values({
      name: data.name,
      displayName: data.displayName,
      createdBy: data.createdBy,
    })
    .returning()
  return role!
}

export async function updateRoleQuery(
  farmSchema: string,
  roleId: string,
  data: { displayName: string }
) {
  const { roles } = getFarmSchema(farmSchema)
  const [role] = await db
    .update(roles)
    .set({ displayName: data.displayName })
    .where(eq(roles.id, roleId))
    .returning()
  return role ?? null
}

export async function deleteRoleQuery(farmSchema: string, roleId: string) {
  const { roles } = getFarmSchema(farmSchema)
  await db.delete(roles).where(eq(roles.id, roleId))
}

export async function upsertRolePermission(
  farmSchema: string,
  roleId: string,
  permissionKey: string,
  grantedBy: string
) {
  const { rolePermissions } = getFarmSchema(farmSchema)
  await db
    .insert(rolePermissions)
    .values({ roleId, permissionKey, grantedBy })
    .onConflictDoNothing()
}

export async function deleteRolePermission(
  farmSchema: string,
  roleId: string,
  permissionKey: string
) {
  const { rolePermissions } = getFarmSchema(farmSchema)
  await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionKey, permissionKey)
      )
    )
}

export async function deleteAllRolePermissions(farmSchema: string, roleId: string) {
  const { rolePermissions } = getFarmSchema(farmSchema)
  await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))
}
