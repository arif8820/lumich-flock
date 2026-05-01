'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
import {
  getStockBalance,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
} from '@/lib/services/stock.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const stockAdjustmentSchema = z.object({
  flockId: z.string().uuid(),
  adjustmentDate: z.coerce.date(),
  grade: z.enum(['A', 'B']),
  quantity: z.coerce.number().int(),
  reason: z.string().min(1).max(500).trim(),
  notes: z.string().max(500).trim().optional(),
})

const regradeRequestSchema = z.object({
  flockId: z.string().uuid(),
  gradeFrom: z.enum(['A', 'B']),
  gradeTo: z.enum(['A', 'B']),
  quantity: z.coerce.number().int().positive(),
  requestDate: z.coerce.date(),
  notes: z.string().max(500).trim().optional(),
})

export async function getStockBalanceAction(
  flockId: string,
  grade: 'A' | 'B'
): Promise<ActionResult<number>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = z.object({ flockId: z.string().uuid(), grade: z.enum(['A', 'B']) }).safeParse({ flockId, grade })
  if (!parsed.success) return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }

  try {
    const balance = await getStockBalance(parsed.data.flockId, parsed.data.grade)
    return { success: true, data: balance }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat saldo stok' }
  }
}

export async function createStockAdjustmentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  const parsed = stockAdjustmentSchema.safeParse({
    flockId: formData.get('flockId'),
    adjustmentDate: formData.get('adjustmentDate'),
    grade: formData.get('grade'),
    quantity: formData.get('quantity'),
    reason: formData.get('reason'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }
  }

  try {
    const result = await createStockAdjustment(parsed.data, session!.id, session!.role)
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan penyesuaian stok' }
  }
}

export async function submitRegradeRequestAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  const parsed = regradeRequestSchema.safeParse({
    flockId: formData.get('flockId'),
    gradeFrom: formData.get('gradeFrom'),
    gradeTo: formData.get('gradeTo'),
    quantity: formData.get('quantity'),
    requestDate: formData.get('requestDate'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }
  }

  try {
    const result = await submitRegradeRequest(parsed.data, session!.id)
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal mengajukan permintaan regrade' }
  }
}

export async function approveRegradeRequestAction(
  requestId: string
): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await approveRegradeRequest(requestId, session!.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyetujui permintaan regrade' }
  }
}

export async function rejectRegradeRequestAction(
  requestId: string
): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await rejectRegradeRequest(requestId, session!.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menolak permintaan regrade' }
  }
}
