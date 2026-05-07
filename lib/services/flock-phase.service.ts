import { unstable_cache } from 'next/cache'
import {
  findAllFlockPhases,
  insertFlockPhase,
  updateFlockPhase,
  deleteFlockPhase,
} from '@/lib/db/queries/flock-phase.queries'
import type { FlockPhase } from '@/lib/db/schema'

export const getAllFlockPhases = unstable_cache(
  async (farmSchema: string): Promise<FlockPhase[]> => findAllFlockPhases(farmSchema),
  ['flock-phases'],
  { revalidate: 3600 }
)

export async function getPhaseForWeeks(farmSchema: string, ageWeeks: number): Promise<FlockPhase | null> {
  const phases = await findAllFlockPhases(farmSchema)
  return phases.find((p) => {
    const aboveMin = ageWeeks >= p.minWeeks
    const belowMax = p.maxWeeks === null || ageWeeks <= p.maxWeeks
    return aboveMin && belowMax
  }) ?? null
}

export async function createFlockPhase(farmSchema: string, input: {
  name: string
  minWeeks: number
  maxWeeks?: number
  sortOrder: number
}): Promise<FlockPhase> {
  return insertFlockPhase(farmSchema, { ...input, maxWeeks: input.maxWeeks ?? null })
}

export async function updateFlockPhaseById(
  farmSchema: string,
  id: string,
  input: Partial<{ name: string; minWeeks: number; maxWeeks: number | null; sortOrder: number }>
): Promise<FlockPhase | null> {
  return updateFlockPhase(farmSchema, id, input)
}

export async function deleteFlockPhaseById(farmSchema: string, id: string): Promise<void> {
  await deleteFlockPhase(farmSchema, id)
}
