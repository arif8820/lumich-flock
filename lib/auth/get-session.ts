import { createSupabaseServerClient } from './server'
import { db } from '@/lib/db'
import { farmUsers, farms } from '@/lib/db/schema'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'
import { unstable_cache } from 'next/cache'
import { ALL_PERMISSIONS, type PermissionKey } from './permissions'

export type SessionUser = {
  id: string
  email: string
  fullName: string
  roleId: string
  roleName: string
  isAdmin: boolean
  isActive: boolean
  createdBy: string | null
  createdAt: Date
  updatedAt: Date | null
  farmSchema: string
  farmName: string
  permissions: Set<PermissionKey>
}

function getCachedSession(userId: string, email: string) {
  return unstable_cache(
    async (): Promise<SessionUser | null> => {
      // 1. Lookup farm schema from public.farm_users
      const [farmUserRow] = await db
        .select()
        .from(farmUsers)
        .where(eq(farmUsers.email, email))
        .limit(1)

      if (!farmUserRow) return null

      const { farmSchema } = farmUserRow

      // 2. Fetch DB user from farm schema + farm name in parallel
      const { users, roles, rolePermissions } = getFarmSchema(farmSchema)
      const [[dbUser], [farmRow]] = await Promise.all([
        db.select().from(users).where(eq(users.id, userId)).limit(1),
        db.select({ name: farms.name }).from(farms).where(eq(farms.schemaName, farmSchema)).limit(1),
      ])

      if (!dbUser || !dbUser.isActive) return null

      // 3. Fetch role and permissions
      const [roleRow] = await db.select().from(roles).where(eq(roles.id, dbUser.roleId)).limit(1)
      if (!roleRow) return null

      let permSet: Set<PermissionKey>
      if (roleRow.isSystem) {
        permSet = new Set(ALL_PERMISSIONS)
      } else {
        const permRows = await db
          .select({ key: rolePermissions.permissionKey })
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, dbUser.roleId))
        permSet = new Set(permRows.map((r) => r.key as PermissionKey))
      }

      return {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        roleId: dbUser.roleId,
        roleName: roleRow.displayName,
        isAdmin: roleRow.isSystem,
        isActive: dbUser.isActive,
        createdBy: dbUser.createdBy,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
        farmSchema,
        farmName: farmRow?.name ?? farmSchema,
        permissions: permSet,
      }
    },
    [`user-session-${userId}`],
    { revalidate: 60, tags: [`user-${userId}`, 'role-permissions'] }
  )()
}

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !user.email) return null

  try {
    return await getCachedSession(user.id, user.email)
  } catch {
    return null
  }
}
