import { getSession } from './get-session'
import type { SessionUser } from './get-session'
import type { PermissionKey } from './permissions'

type GuardFailure = { success: false; error: string }

export async function requireAuth(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  return null
}

export function hasPermission(session: SessionUser, key: PermissionKey): boolean {
  if (session.isAdmin) return true
  return session.permissions.has(key)
}

export function requirePermission(session: SessionUser, key: PermissionKey): GuardFailure | null {
  if (hasPermission(session, key)) return null
  return { success: false, error: 'Akses ditolak' }
}

// Helper: get session and fail fast if not authenticated
export async function getRequiredSession(): Promise<SessionUser | GuardFailure> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  return session
}

/** @deprecated Use requirePermission() instead. Will be removed in Task 6. */
export async function requireSupervisorOrAdmin(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  if (!session.isAdmin && session.permissions.size === 0) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

/** @deprecated Use requirePermission() instead. Will be removed in Task 6. */
export async function requireAdmin(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session || !session.isAdmin) return { success: false, error: 'Akses ditolak' }
  return null
}
