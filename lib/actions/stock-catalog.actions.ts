'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import {
  createCategory,
  createStockItem,
  toggleStockItemActive,
} from '@/lib/services/stock-catalog.service'

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

const createCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  unit: z.string().min(1).max(50).trim(),
})

const createStockItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
})

export async function createCategoryAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = createCategorySchema.safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const category = await createCategory(session.farmSchema, parsed.data)
    return { success: true, data: { id: category.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat kategori' }
  }
}

export async function createStockItemAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = createStockItemSchema.safeParse({
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
  })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }
  }

  try {
    const item = await createStockItem(session.farmSchema, parsed.data)
    return { success: true, data: { id: item.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal membuat item stok' }
  }
}

export async function toggleStockItemActiveAction(
  itemId: string
): Promise<ActionResult> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role !== 'admin') return { success: false, error: 'Akses ditolak' }

  const parsed = z.string().uuid().safeParse(itemId)
  if (!parsed.success) return { success: false, error: 'ID tidak valid' }

  try {
    await toggleStockItemActive(session.farmSchema, parsed.data)
    return { success: true, data: undefined }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Gagal mengubah status item' }
  }
}
