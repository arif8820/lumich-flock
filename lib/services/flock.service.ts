import {
  findAllActiveFlocks,
  findFlockById,
  insertFlock,
  updateFlock,
} from '@/lib/db/queries/flock.queries'
import { getPhaseForWeeks } from '@/lib/services/flock-phase.service'
import type { Flock, FlockPhase } from '@/lib/db/schema'

export type FlockWithMeta = Flock & {
  coopName: string
  ageWeeks: number
  phase: FlockPhase | null
}

export function getFlockAgeWeeks(arrivalDate: Date, today: Date = new Date()): number {
  const diffMs = today.getTime() - arrivalDate.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7))
}

export async function getAllActiveFlocks(): Promise<FlockWithMeta[]> {
  const flocks = await findAllActiveFlocks()
  return Promise.all(
    flocks.map(async (flock) => {
      const ageWeeks = getFlockAgeWeeks(new Date(flock.arrivalDate))
      const phase = await getPhaseForWeeks(ageWeeks)
      return { ...flock, ageWeeks, phase }
    })
  )
}

type CreateFlockInput = {
  coopId: string
  name: string
  arrivalDate: Date
  initialCount: number
  breed?: string
  notes?: string
  createdBy: string
}

export async function createFlock(input: CreateFlockInput): Promise<Flock> {
  return insertFlock({
    ...input,
    arrivalDate: input.arrivalDate,
    createdBy: input.createdBy,
  })
}

export async function updateFlockById(
  id: string,
  input: Partial<Omit<CreateFlockInput, 'createdBy'>>,
  updatedBy: string
): Promise<Flock | null> {
  return updateFlock(id, { ...input, updatedBy })
}

export async function retireFlock(id: string, updatedBy: string): Promise<void> {
  await updateFlock(id, { retiredAt: new Date(), updatedBy })
}
