import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/flock-phase.queries', () => ({
  findAllFlockPhases: vi.fn(),
  insertFlockPhase: vi.fn(),
  updateFlockPhase: vi.fn(),
  deleteFlockPhase: vi.fn(),
}))

import * as queries from '@/lib/db/queries/flock-phase.queries'
import { getPhaseForWeeks, getAllFlockPhases } from './flock-phase.service'

const mockPhases = [
  { id: '1', name: 'Starter', minWeeks: 0, maxWeeks: 6, sortOrder: 1, createdAt: new Date(), updatedAt: null },
  { id: '2', name: 'Grower', minWeeks: 7, maxWeeks: 18, sortOrder: 2, createdAt: new Date(), updatedAt: null },
  { id: '3', name: 'Layer', minWeeks: 19, maxWeeks: 72, sortOrder: 3, createdAt: new Date(), updatedAt: null },
  { id: '4', name: 'Late-layer', minWeeks: 73, maxWeeks: null, sortOrder: 4, createdAt: new Date(), updatedAt: null },
]

describe('flock-phase.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(queries.findAllFlockPhases).mockResolvedValue(mockPhases)
  })

  describe('getPhaseForWeeks', () => {
    it('returns Starter for week 3', async () => {
      const phase = await getPhaseForWeeks(3)
      expect(phase?.name).toBe('Starter')
    })

    it('returns Layer for week 25', async () => {
      const phase = await getPhaseForWeeks(25)
      expect(phase?.name).toBe('Layer')
    })

    it('returns Late-layer for week 80 (maxWeeks null)', async () => {
      const phase = await getPhaseForWeeks(80)
      expect(phase?.name).toBe('Late-layer')
    })

    it('returns null if no phase matches', async () => {
      vi.mocked(queries.findAllFlockPhases).mockResolvedValue([])
      const phase = await getPhaseForWeeks(5)
      expect(phase).toBeNull()
    })
  })
})
