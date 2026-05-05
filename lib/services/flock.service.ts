import {
  findAllActiveFlocks,
  updateFlock,
  findActiveFlockByCoopId,
} from '@/lib/db/queries/flock.queries'
import { insertFlockDelivery, sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import { db } from '@/lib/db'
import { flocks, flockDeliveries } from '@/lib/db/schema'
import type { Flock, FlockPhase } from '@/lib/db/schema'

export type FlockWithMeta = Flock & {
  coopName: string
  ageWeeks: number
  phase: FlockPhase | null
  totalCount: number
}

export function getFlockAgeDays(docDate: Date, today: Date = new Date()): number {
  const diffMs = today.getTime() - docDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function getFlockAgeWeeks(docDate: Date, today: Date = new Date()): number {
  return Math.floor(getFlockAgeDays(docDate, today) / 7)
}

export async function getAllActiveFlocks(): Promise<FlockWithMeta[]> {
  const rawFlocks = await findAllActiveFlocks()
  return Promise.all(
    rawFlocks.map(async (flock) => {
      const ageWeeks = getFlockAgeWeeks(new Date(flock.docDate))
      const phase = await getPhaseForWeeks(ageWeeks)
      const totalCount = await sumDeliveriesQuantityByFlockId(flock.id)
      return { ...flock, ageWeeks, phase, totalCount }
    })
  )
}

type CreateFlockInput = {
  coopId: string
  name: string
  arrivalDate: Date
  breed?: string
  notes?: string
  createdBy: string
  // First delivery
  firstDeliveryDate: Date
  firstDeliveryQuantity: number
  ageAtArrivalDays?: number
}

export async function createFlock(input: CreateFlockInput): Promise<Flock & { totalCount: number }> {
  // Check: 1 active flock per coop
  const existing = await findActiveFlockByCoopId(input.coopId)
  if (existing) {
    throw new Error('Kandang ini sudah memiliki flock aktif. Pensiunkan flock lama terlebih dahulu.')
  }

  // Calculate DOC birth date from first delivery date minus age at arrival
  const ageAtArrival = input.ageAtArrivalDays ?? 0
  const docDate = new Date(input.firstDeliveryDate)
  docDate.setDate(docDate.getDate() - ageAtArrival)

  return db.transaction(async (tx) => {
    const [flock] = await tx
      .insert(flocks)
      .values({
        coopId: input.coopId,
        name: input.name,
        arrivalDate: input.arrivalDate,
        docDate,
        breed: input.breed,
        notes: input.notes,
        createdBy: input.createdBy,
      })
      .returning()

    await tx
      .insert(flockDeliveries)
      .values({
        flockId: flock!.id,
        deliveryDate: input.firstDeliveryDate,
        quantity: input.firstDeliveryQuantity,
        ageAtArrivalDays: input.ageAtArrivalDays ?? 0,
        createdBy: input.createdBy,
      })

    return { ...flock!, totalCount: input.firstDeliveryQuantity }
  })
}

export async function updateFlockById(
  id: string,
  input: Partial<Pick<CreateFlockInput, 'name' | 'breed' | 'notes' | 'arrivalDate'>>,
  updatedBy: string
): Promise<Flock | null> {
  return updateFlock(id, { ...input, updatedBy })
}

export async function retireFlock(id: string, updatedBy: string): Promise<void> {
  await updateFlock(id, { retiredAt: new Date(), updatedBy })
}

// Re-export for consumers that need it
export { insertFlockDelivery }
