'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import {
  createDraftSO,
  confirmSO,
  cancelSO,
  deleteDraftSO,
  fulfillSO,
} from '@/lib/services/sales-order.service'

const salesOrderItemSchema = z.object({
  itemType: z.enum(['egg_grade_a', 'egg_grade_b', 'flock', 'other']),
  itemRefId: z.string().uuid().optional(),
  description: z.string().optional(),
  quantity: z.coerce.number().int().min(1),
  unit: z.enum(['butir', 'ekor', 'unit']),
  pricePerUnit: z.coerce.number().min(0),
  discountPct: z.coerce.number().min(0).max(100).optional(),
})

const createSalesOrderSchema = z.object({
  customerId: z.string().uuid('ID pelanggan tidak valid'),
  orderDate: z.coerce.date(),
  paymentMethod: z.enum(['cash', 'credit']),
  taxPct: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  overrideReason: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, 'Item tidak boleh kosong'),
})

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function requireSupervisorOrAdmin(): Promise<{ success: false; error: string } | null> {
  const session = await getSession()
  if (!session || !['supervisor', 'admin'].includes(session.role)) {
    return { success: false, error: 'Akses ditolak' }
  }
  return null
}

export async function createDraftSOAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  // Parse items array from FormData
  const itemsJson = formData.get('items')
  if (!itemsJson || typeof itemsJson !== 'string') {
    return { success: false, error: 'Data item tidak valid' }
  }

  let items
  try {
    items = JSON.parse(itemsJson)
  } catch {
    return { success: false, error: 'Data item tidak valid' }
  }

  const parsed = createSalesOrderSchema.safeParse({
    customerId: formData.get('customerId'),
    orderDate: formData.get('orderDate'),
    paymentMethod: formData.get('paymentMethod'),
    taxPct: formData.get('taxPct') || undefined,
    notes: formData.get('notes') || undefined,
    overrideReason: formData.get('overrideReason') || undefined,
    items,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const so = await createDraftSO(parsed.data, session!.id, session!.role)
    return { success: true, data: { id: so.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal membuat SO' }
  }
}

export async function confirmSOAction(orderId: string): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await confirmSO(orderId, session!.id, session!.role)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal mengkonfirmasi SO' }
  }
}

export async function cancelSOAction(orderId: string): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await cancelSO(orderId, session!.id, session!.role)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal membatalkan SO' }
  }
}

export async function deleteDraftSOAction(orderId: string): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await deleteDraftSO(orderId, session!.id, session!.role)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menghapus draft SO' }
  }
}

export async function fulfillSOAction(orderId: string): Promise<ActionResult> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await fulfillSO(orderId, session!.id, session!.role)
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal memproses SO' }
  }
}
