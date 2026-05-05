import { insertFlockDelivery, findDeliveriesByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { findFlockById } from '@/lib/db/queries/flock.queries'
import { findAssignedCoopIds } from '@/lib/db/queries/user-coop-assignment.queries'
import type { FlockDelivery } from '@/lib/db/schema'

type CreateFlockDeliveryInput = {
  flockId: string
  deliveryDate: Date
  quantity: number
  ageAtArrivalDays?: number
  notes?: string
  createdBy: string
}

export async function createFlockDelivery(
  input: CreateFlockDeliveryInput,
  callerRole?: 'operator' | 'supervisor' | 'admin'
): Promise<FlockDelivery> {
  const flock = await findFlockById(input.flockId)
  if (!flock) throw new Error('Flock tidak ditemukan')

  if (flock.retiredAt !== null) {
    throw new Error('Flock ini sudah pensiun. Tidak dapat menambahkan kedatangan baru.')
  }

  if (callerRole === 'operator') {
    const assignedCoopIds = await findAssignedCoopIds(input.createdBy)
    if (!assignedCoopIds.includes(flock.coopId)) {
      throw new Error('Akses ditolak: kandang tidak dalam assignment Anda')
    }
  }

  return insertFlockDelivery({
    flockId: input.flockId,
    deliveryDate: input.deliveryDate,
    quantity: input.quantity,
    ageAtArrivalDays: input.ageAtArrivalDays ?? null,
    notes: input.notes ?? null,
    createdBy: input.createdBy,
  })
}

export async function getDeliveriesByFlockId(flockId: string): Promise<FlockDelivery[]> {
  return findDeliveriesByFlockId(flockId)
}
