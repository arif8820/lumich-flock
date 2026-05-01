'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth/get-session'
import { requireSupervisorOrAdmin, requireAdmin } from '@/lib/auth/guards'
import {
  createSalesReturn,
  approveSalesReturn,
  rejectSalesReturn,
} from '@/lib/services/sales-return.service'

const salesReturnItemSchema = z.object({
  itemType: z.enum(['egg_grade_a', 'egg_grade_b', 'flock', 'other']),
  itemRefId: z.string().uuid().optional(),
  quantity: z.coerce.number().int().min(1),
  unit: z.enum(['butir', 'ekor', 'unit']),
})

const createSalesReturnSchema = z.object({
  orderId: z.string().uuid('ID SO tidak valid'),
  returnDate: z.coerce.date(),
  reasonType: z.enum(['wrong_grade', 'damaged', 'quantity_error', 'other']),
  notes: z.string().max(500).trim().optional(),
  items: z.array(salesReturnItemSchema).min(1, 'Item tidak boleh kosong'),
})

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createSalesReturnAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const guard = await requireSupervisorOrAdmin()
  if (guard) return guard

  const session = await getSession()

  // Parse items array from FormData
  const itemsJson = formData.get('items')
  if (!itemsJson || typeof itemsJson !== 'string') {
    return { success: false, error: 'Data item tidak valid' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] // any: raw JSON from FormData, validated by zod immediately after
  try {
    items = JSON.parse(itemsJson)
  } catch {
    return { success: false, error: 'Data item tidak valid' }
  }

  const parsed = createSalesReturnSchema.safeParse({
    orderId: formData.get('orderId'),
    returnDate: formData.get('returnDate'),
    reasonType: formData.get('reasonType'),
    notes: formData.get('notes') || undefined,
    items,
  })

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const salesReturn = await createSalesReturn(parsed.data, session!.id, session!.role)
    revalidatePath('/penjualan/return')
    return { success: true, data: { id: salesReturn.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal membuat return' }
  }
}

export async function approveSalesReturnAction(returnId: string): Promise<ActionResult<undefined>> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await approveSalesReturn(returnId, session!.id, session!.role)
    revalidatePath(`/penjualan/return/${returnId}`)
    revalidatePath('/penjualan/return')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menyetujui return' }
  }
}

export async function rejectSalesReturnAction(returnId: string): Promise<ActionResult<undefined>> {
  const guard = await requireAdmin()
  if (guard) return guard

  const session = await getSession()

  try {
    await rejectSalesReturn(returnId, session!.id, session!.role)
    revalidatePath(`/penjualan/return/${returnId}`)
    revalidatePath('/penjualan/return')
    return { success: true, data: undefined }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Gagal menolak return' }
  }
}
