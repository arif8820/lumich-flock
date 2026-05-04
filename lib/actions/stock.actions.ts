'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
import {
  getStockBalance,
  getAllStockBalances,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
  createStockPurchase,
  type StockBalance,
} from '@/lib/services/stock.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function getStockBalanceAction(
  stockItemId: string
): Promise<ActionResult<number>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  const parsed = z.string().uuid().safeParse(stockItemId)
  if (!parsed.success) return { success: false, error: 'Input tidak valid' }

  try {
    const balance = await getStockBalance(parsed.data)
    return { success: true, data: balance }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat saldo stok' }
  }
}

export async function getAllStockBalancesAction(): Promise<ActionResult<StockBalance[]>> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Tidak terautentikasi' }

  try {
    const balances = await getAllStockBalances()
    return { success: true, data: balances }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat stok' }
  }
}

const stockAdjustmentSchema = z.object({
  stockItemId: z.string().uuid(),
  adjustmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantity: z.coerce.number().int(),
  reason: z.string().min(1).max(500).trim(),
  notes: z.string().max(500).trim().optional(),
})

const regradeRequestSchema = z.object({
  fromItemId: z.string().uuid(),
  toItemId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  requestDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).trim().optional(),
})

const stockPurchaseSchema = z.object({
  stockItemId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().max(500).trim().optional(),
})

export async function createStockAdjustmentAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  const parsed = stockAdjustmentSchema.safeParse({
    stockItemId: formData.get('stockItemId'),
    adjustmentDate: formData.get('adjustmentDate'),
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
    fromItemId: formData.get('fromItemId'),
    toItemId: formData.get('toItemId'),
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

export async function createStockPurchaseAction(
  formData: FormData
): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  const parsed = stockPurchaseSchema.safeParse({
    stockItemId: formData.get('stockItemId'),
    quantity: formData.get('quantity'),
    purchaseDate: formData.get('purchaseDate'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) {
    return { success: false, error: 'Input tidak valid. Periksa kembali data yang diisi.' }
  }

  try {
    await createStockPurchase(parsed.data, session!.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan pembelian stok' }
  }
}
