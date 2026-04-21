import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/flock.queries', () => ({
  findAllActiveFlocks: vi.fn(),
  findFlockById: vi.fn(),
  insertFlock: vi.fn(),
  updateFlock: vi.fn(),
}))

vi.mock('@/lib/services/flock-phase.service', () => ({
  getPhaseForWeeks: vi.fn(),
}))

import * as flockQueries from '@/lib/db/queries/flock.queries'
import * as flockPhaseService from '@/lib/services/flock-phase.service'
import { getFlockAgeWeeks, retireFlock, createFlock } from './flock.service'

describe('flock.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getFlockAgeWeeks', () => {
    it('calculates age in weeks from arrival date', () => {
      const arrivalDate = new Date('2025-01-01')
      const today = new Date('2025-03-12') // 70 days = 10 weeks
      const weeks = getFlockAgeWeeks(arrivalDate, today)
      expect(weeks).toBe(10)
    })

    it('returns 0 for same-day arrival', () => {
      const today = new Date('2025-01-01')
      expect(getFlockAgeWeeks(today, today)).toBe(0)
    })
  })

  describe('retireFlock', () => {
    it('sets retiredAt to now', async () => {
      vi.mocked(flockQueries.updateFlock).mockResolvedValue({ id: 'flock-1', retiredAt: new Date() } as any) // any: partial Flock for mock

      await retireFlock('flock-1', 'admin-id')

      expect(flockQueries.updateFlock).toHaveBeenCalledWith(
        'flock-1',
        expect.objectContaining({ retiredAt: expect.any(Date), updatedBy: 'admin-id' })
      )
    })
  })
})
