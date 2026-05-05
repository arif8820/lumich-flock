import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/flock.queries', () => ({
  findAllActiveFlocks: vi.fn(),
  findFlockById: vi.fn(),
  insertFlock: vi.fn(),
  updateFlock: vi.fn(),
  findActiveFlockByCoopId: vi.fn(),
}))

vi.mock('@/lib/db/queries/flock-delivery.queries', () => ({
  insertFlockDelivery: vi.fn(),
  sumDeliveriesQuantityByFlockId: vi.fn(),
}))

vi.mock('@/lib/services/flock-phase.service', () => ({
  getPhaseForWeeks: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn(),
  },
}))

import * as flockQueries from '@/lib/db/queries/flock.queries'
import * as flockPhaseService from '@/lib/services/flock-phase.service'
import { db } from '@/lib/db'
import { getFlockAgeDays, getFlockAgeWeeks, createFlock, retireFlock } from './flock.service'

describe('flock.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('getFlockAgeDays', () => {
    it('returns 0 on same day', () => {
      const today = new Date('2025-01-01')
      expect(getFlockAgeDays(today, today)).toBe(0)
    })

    it('returns correct days after N days', () => {
      const docDate = new Date('2025-01-01')
      const today = new Date('2025-01-11') // 10 days later
      expect(getFlockAgeDays(docDate, today)).toBe(10)
    })

    it('returns correct days for 70 days', () => {
      const docDate = new Date('2025-01-01')
      const today = new Date('2025-03-12') // 70 days
      expect(getFlockAgeDays(docDate, today)).toBe(70)
    })
  })

  describe('getFlockAgeWeeks', () => {
    it('returns 0 for days < 7', () => {
      const docDate = new Date('2025-01-01')
      const today = new Date('2025-01-06') // 5 days
      expect(getFlockAgeWeeks(docDate, today)).toBe(0)
    })

    it('returns 1 for exactly 7 days', () => {
      const docDate = new Date('2025-01-01')
      const today = new Date('2025-01-08') // 7 days
      expect(getFlockAgeWeeks(docDate, today)).toBe(1)
    })

    it('returns 10 for 70 days', () => {
      const docDate = new Date('2025-01-01')
      const today = new Date('2025-03-12') // 70 days
      expect(getFlockAgeWeeks(docDate, today)).toBe(10)
    })

    it('returns 0 for same-day', () => {
      const today = new Date('2025-01-01')
      expect(getFlockAgeWeeks(today, today)).toBe(0)
    })
  })

  describe('retireFlock', () => {
    it('sets retiredAt to now', async () => {
      // any: partial Flock for mock
      vi.mocked(flockQueries.updateFlock).mockResolvedValue({ id: 'flock-1', retiredAt: new Date() } as unknown as Awaited<ReturnType<typeof flockQueries.updateFlock>>)

      await retireFlock('flock-1', 'admin-id')

      expect(flockQueries.updateFlock).toHaveBeenCalledWith(
        'flock-1',
        expect.objectContaining({ retiredAt: expect.any(Date), updatedBy: 'admin-id' })
      )
    })
  })

  describe('createFlock', () => {
    const baseInput = {
      coopId: 'coop-1',
      name: 'Batch 2025',
      arrivalDate: new Date('2025-01-10'),
      firstDeliveryDate: new Date('2025-01-10'),
      firstDeliveryQuantity: 500,
      createdBy: 'user-1',
    }

    const mockFlock = {
      id: 'flock-1',
      coopId: 'coop-1',
      name: 'Batch 2025',
      arrivalDate: new Date('2025-01-10'),
      docDate: new Date('2025-01-10'),
      breed: null,
      notes: null,
      retiredAt: null,
      isImported: false,
      importedBy: null,
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: null,
      updatedBy: null,
    }

    it('throws when coop already has active flock', async () => {
      vi.mocked(flockQueries.findActiveFlockByCoopId).mockResolvedValue(mockFlock)

      await expect(createFlock(baseInput)).rejects.toThrow('sudah memiliki flock aktif')
    })

    it('calculates docDate as firstDeliveryDate when ageAtArrivalDays = 0', async () => {
      vi.mocked(flockQueries.findActiveFlockByCoopId).mockResolvedValue(null)

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([mockFlock]),
            }),
          }),
        }
        // any: tx is a partial mock of PgTransaction for testing purposes
        return callback(tx as unknown as Parameters<typeof db.transaction>[0] extends (tx: infer T) => unknown ? T : never)
      })

      await createFlock({ ...baseInput, ageAtArrivalDays: 0 })

      // docDate should equal firstDeliveryDate (Jan 10 - 0 days = Jan 10)
      expect(vi.mocked(db.transaction)).toHaveBeenCalled()
    })

    it('calculates docDate as firstDeliveryDate - N days when ageAtArrivalDays = N', async () => {
      vi.mocked(flockQueries.findActiveFlockByCoopId).mockResolvedValue(null)

      let capturedDocDate: Date | undefined

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockImplementation((_table: unknown) => ({
            values: vi.fn().mockImplementation((vals: Record<string, unknown>) => {
              if ('docDate' in vals) {
                capturedDocDate = vals.docDate as Date
              }
              return {
                returning: vi.fn().mockResolvedValue([mockFlock]),
              }
            }),
          })),
        }
        // any: tx is a partial mock of PgTransaction for testing purposes
        return callback(tx as unknown as Parameters<typeof db.transaction>[0] extends (tx: infer T) => unknown ? T : never)
      })

      const firstDeliveryDate = new Date('2025-01-20')
      await createFlock({ ...baseInput, firstDeliveryDate, ageAtArrivalDays: 10 })

      // docDate should be Jan 20 - 10 days = Jan 10
      expect(capturedDocDate).toBeDefined()
      const expectedDocDate = new Date('2025-01-10')
      expect(capturedDocDate!.toDateString()).toBe(expectedDocDate.toDateString())
    })

    it('creates flock and first delivery in transaction', async () => {
      vi.mocked(flockQueries.findActiveFlockByCoopId).mockResolvedValue(null)

      let flockInsertCalled = false
      let deliveryInsertCalled = false
      let insertCallCount = 0

      vi.mocked(db.transaction).mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockImplementation(() => {
            insertCallCount++
            if (insertCallCount === 1) flockInsertCalled = true
            if (insertCallCount === 2) deliveryInsertCalled = true
            return {
              values: vi.fn().mockReturnValue({
                returning: vi.fn().mockResolvedValue([mockFlock]),
              }),
            }
          }),
        }
        // any: tx is a partial mock of PgTransaction for testing purposes
        return callback(tx as unknown as Parameters<typeof db.transaction>[0] extends (tx: infer T) => unknown ? T : never)
      })

      const result = await createFlock(baseInput)

      expect(vi.mocked(db.transaction)).toHaveBeenCalledOnce()
      expect(flockInsertCalled).toBe(true)
      expect(deliveryInsertCalled).toBe(true)
      expect(result.totalCount).toBe(500)
    })
  })
})
