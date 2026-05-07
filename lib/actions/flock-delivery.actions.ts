'use server'

import { z } from 'zod'
import { getRequiredSession } from '@/lib/auth/guards'
import { createFlockDelivery } from '@/lib/services/flock-delivery.service'

const flockDeliverySchema = z.object({
  flockId: z.string().uuid('Flock tidak valid'),
  deliveryDate: z.coerce.date(),
  quantity: z.coerce.number().int().positive('Jumlah DOC harus positif'),
  ageAtArrivalDays: z.coerce.number().int().nonnegative().optional(),
  notes: z.string().optional(),
})

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createFlockDeliveryAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const session = await getRequiredSession()
  if ('error' in session) return session
  if (session.role === 'operator') return { success: false, error: 'Akses ditolak' }

  const parsed = flockDeliverySchema.safeParse({
    flockId: formData.get('flockId'),
    deliveryDate: formData.get('deliveryDate'),
    quantity: formData.get('quantity'),
    ageAtArrivalDays: formData.get('ageAtArrivalDays') || undefined,
    notes: formData.get('notes') || undefined,
  })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }

  try {
    const delivery = await createFlockDelivery(session.farmSchema, { ...parsed.data, createdBy: session.id })
    return { success: true, data: { id: delivery.id } }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menambahkan kedatangan'
    return { success: false, error: msg }
  }
}
