import { getSession } from './get-session'

type GuardFailure = { success: false; error: string }

export async function requireAuth(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }
  return null
}

export async function requireSupervisorOrAdmin(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session || !['supervisor', 'admin'].includes(session.role)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

export async function requireAdmin(): Promise<GuardFailure | null> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}
