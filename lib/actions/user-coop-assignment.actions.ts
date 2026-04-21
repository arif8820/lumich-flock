'use server'

import { getSession } from '@/lib/auth/get-session'
import {
  findAssignmentsByUser,
  findAssignedCoopIds,
  insertAssignment,
  deleteAssignment,
} from '@/lib/db/queries/user-coop-assignment.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { success: false, error: 'Akses ditolak' }
  return null
}

export async function getAssignmentsForUserAction(
  userId: string
): Promise<ActionResult<Awaited<ReturnType<typeof findAssignmentsByUser>>>> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    const assignments = await findAssignmentsByUser(userId)
    return { success: true, data: assignments }
  } catch {
    return { success: false, error: 'Gagal memuat assignment' }
  }
}

export async function getAssignedCoopIdsAction(userId: string): Promise<string[]> {
  const session = await getSession()
  if (!session) return []
  // User bisa lihat coop assignment mereka sendiri; admin bisa lihat semua
  if (session.role !== 'admin' && session.id !== userId) return []
  return findAssignedCoopIds(userId)
}

export async function assignCoopToUserAction(userId: string, coopId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    await insertAssignment(userId, coopId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal assign kandang' }
  }
}

export async function removeCoopFromUserAction(userId: string, coopId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  try {
    await deleteAssignment(userId, coopId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal hapus assignment' }
  }
}
