'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
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
  const session = await getRequiredSession()
  if ('error' in session) return session

  const parsed = z.string().uuid().safeParse(stockItemId)
  if (!parsed.success) return { success: false, error: 'Input tidak valid' }

  try {
    const balance = await getStockBalance(session.farmSchema, parsed.data)
    return { success: true, data: balance }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal memuat saldo stok' }
  }
}

export async function getAllStockBalancesAction(): Promise<ActionResult<StockBalance[]>> {
  const session = await getRequiredSession()
  if ('error' in session) return session

  try {
    const balances = await getAllStockBalances(session.farmSchema)
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
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (!['supervisor', 'admin'].includes(session.role)) return { success: false, error: 'Akses ditolak' }

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
    const result = await createStockAdjustment(session.farmSchema, parsed.data, session.id, session.role)
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan penyesuaian stok' }
  }
}

export async function submitRegradeRequestAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (!['supervisor', 'admin'].includes(session.role)) return { success: false, error: 'Akses ditolak' }

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
    const result = await submitRegradeRequest(session.farmSchema, parsed.data, session.id)
    return { success: true, data: { id: result.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal mengajukan permintaan regrade' }
  }
}

export async function approveRegradeRequestAction(
  requestId: string
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await approveRegradeRequest(session.farmSchema, requestId, session.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyetujui permintaan regrade' }
  }
}

export async function rejectRegradeRequestAction(
  requestId: string
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  try {
    await rejectRegradeRequest(session.farmSchema, requestId, session.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menolak permintaan regrade' }
  }
}

export async function createStockPurchaseAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (!['supervisor', 'admin'].includes(session.role)) return { success: false, error: 'Akses ditolak' }

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
    await createStockPurchase(session.farmSchema, parsed.data, session.id)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal menyimpan pembelian stok' }
  }
}
