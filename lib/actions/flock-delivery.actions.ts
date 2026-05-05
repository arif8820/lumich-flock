'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth/get-session'
import { createFlockDelivery } from '@/lib/services/flock-delivery.service'

const flockDeliverySchema = z.object({
  flockId: z.string().uuid('Flock tidak valid'),
  deliveryDate: z.coerce.date(),
  quantity: z.coerce.number().int().positive('Jumlah DOC harus positif'),
  notes: z.string().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createFlockDeliveryAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getSession()
  if (!session || session.role === 'operator') return { success: false, error: 'Akses ditolak' }

  const parsed = flockDeliverySchema.safeParse({
    flockId: formData.get('flockId'),
    deliveryDate: formData.get('deliveryDate'),
    quantity: formData.get('quantity'),
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const delivery = await createFlockDelivery({ ...parsed.data, createdBy: session.id })
    return { success: true, data: { id: delivery.id } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan kedatangan'
    return { success: false, error: msg }
  }
}
