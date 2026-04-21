import { unstable_cache } from 'next/cache'
import {
  findAllFlockPhases,
  insertFlockPhase,
  updateFlockPhase,
  deleteFlockPhase,
} from '@/lib/db/queries/flock-phase.queries'
import type { FlockPhase } from '@/lib/db/schema'

export const getAllFlockPhases = unstable_cache(
  async (): Promise<FlockPhase[]> => findAllFlockPhases(),
  ['flock-phases'],
  { revalidate: 3600 }
)

export async function getPhaseForWeeks(ageWeeks: number): Promise<FlockPhase | null> {
  const phases = await findAllFlockPhases()
  return phases.find((p) => {
    const aboveMin = ageWeeks >= p.minWeeks
    const belowMax = p.maxWeeks === null || ageWeeks <= p.maxWeeks
    return aboveMin && belowMax
  }) ?? null
}

export async function createFlockPhase(input: {
  name: string
  minWeeks: number
  maxWeeks?: number
  sortOrder: number
}): Promise<FlockPhase> {
  return insertFlockPhase({ ...input, maxWeeks: input.maxWeeks ?? null })
}

export async function updateFlockPhaseById(
  id: string,
  input: Partial<{ name: string; minWeeks: number; maxWeeks: number | null; sortOrder: number }>
): Promise<FlockPhase | null> {
  return updateFlockPhase(id, input)
}

export async function deleteFlockPhaseById(id: string): Promise<void> {
  await deleteFlockPhase(id)
}
