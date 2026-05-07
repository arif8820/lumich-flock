'use server'

import { getRequiredSession } from '@/lib/auth/guards'
import {
  findAssignmentsByUser,
  findAssignedCoopIds,
  insertAssignment,
  deleteAssignment,
} from '@/lib/db/queries/user-coop-assignment.queries'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getAssignmentsForUserAction(
  userId: string
): Promise<ActionResult<Awaited<ReturnType<typeof findAssignmentsByUser>>>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    const assignments = await findAssignmentsByUser(session.farmSchema, userId)
    return { success: true, data: assignments }
  } catch {
    return { success: false, error: 'Gagal memuat assignment' }
  }
}

export async function getAssignedCoopIdsAction(userId: string): Promise<string[]> {
  const session = await getRequiredSession()
  if ('error' in session) return []
  // User bisa lihat coop assignment mereka sendiri; admin bisa lihat semua
  if (session.role !== 'admin' && session.id !== userId) return []
  return findAssignedCoopIds(session.farmSchema, userId)
}

export async function assignCoopToUserAction(userId: string, coopId: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await insertAssignment(session.farmSchema, userId, coopId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal assign kandang' }
  }
}

export async function removeCoopFromUserAction(userId: string, coopId: string): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await deleteAssignment(session.farmSchema, userId, coopId)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Gagal hapus assignment' }
  }
}
