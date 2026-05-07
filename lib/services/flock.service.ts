import {
  findAllActiveFlocks,
  updateFlock,
  findActiveFlockByCoopId,
} from '@/lib/db/queries/flock.queries'
import { insertFlockDelivery, sumDeliveriesQuantityByFlockId } from '@/lib/db/queries/flock-delivery.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
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

export async function getAllActiveFlocks(farmSchema: string): Promise<FlockWithMeta[]> {
  const rawFlocks = await findAllActiveFlocks(farmSchema)
  return Promise.all(
    rawFlocks.map(async (flock) => {
      const ageWeeks = getFlockAgeWeeks(new Date(flock.docDate))
      const phase = await getPhaseForWeeks(farmSchema, ageWeeks)
      const totalCount = await sumDeliveriesQuantityByFlockId(farmSchema, flock.id)
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

export async function createFlock(farmSchema: string, input: CreateFlockInput): Promise<Flock & { totalCount: number }> {
  // Check: 1 active flock per coop
  const existing = await findActiveFlockByCoopId(farmSchema, input.coopId)
  if (existing) {
    throw new Error('Kandang ini sudah memiliki flock aktif. Pensiunkan flock lama terlebih dahulu.')
  }

  // Calculate DOC birth date from first delivery date minus age at arrival
  const ageAtArrival = input.ageAtArrivalDays ?? 0
  const docDate = new Date(input.firstDeliveryDate)
  docDate.setDate(docDate.getDate() - ageAtArrival)

  const { flocks, flockDeliveries } = getFarmSchema(farmSchema)

  // any: tx typed against public schema; farm schema tables need cast
  return db.transaction(async (tx: any) => {
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
  farmSchema: string,
  id: string,
  input: Partial<Pick<CreateFlockInput, 'name' | 'breed' | 'notes' | 'arrivalDate'>>,
  updatedBy: string
): Promise<Flock | null> {
  return updateFlock(farmSchema, id, { ...input, updatedBy })
}

export async function retireFlock(farmSchema: string, id: string, updatedBy: string): Promise<void> {
  await updateFlock(farmSchema, id, { retiredAt: new Date(), updatedBy })
}

// Re-export for consumers that need it
export { insertFlockDelivery }
