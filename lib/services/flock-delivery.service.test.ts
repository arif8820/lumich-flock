import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/flock-delivery.queries', () => ({
  insertFlockDelivery: vi.fn(),
  findDeliveriesByFlockId: vi.fn(),
  sumDeliveriesQuantityByFlockId: vi.fn(),
}))

vi.mock('@/lib/db/queries/flock.queries', () => ({
  findFlockById: vi.fn(),
  findAllActiveFlocks: vi.fn(),
  insertFlock: vi.fn(),
  updateFlock: vi.fn(),
  findActiveFlockByCoopId: vi.fn(),
}))

vi.mock('@/lib/db/queries/user-coop-assignment.queries', () => ({
  findAssignedCoopIds: vi.fn(),
  findAssignmentsByUser: vi.fn(),
  insertAssignment: vi.fn(),
  deleteAssignment: vi.fn(),
}))

import * as deliveryQueries from '@/lib/db/queries/flock-delivery.queries'
import * as flockQueries from '@/lib/db/queries/flock.queries'
import * as assignmentQueries from '@/lib/db/queries/user-coop-assignment.queries'
import { createFlockDelivery } from './flock-delivery.service'
import type { FlockDelivery } from '@/lib/db/schema'

describe('flock-delivery.service', () => {
  beforeEach(() => vi.clearAllMocks())

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

  const mockDelivery: FlockDelivery = {
    id: 'delivery-1',
    flockId: 'flock-1',
    deliveryDate: new Date('2025-01-10'),
    quantity: 500,
    ageAtArrivalDays: null,
    notes: null,
    createdBy: 'user-1',
    createdAt: new Date(),
  }

  const baseInput = {
    flockId: 'flock-1',
    deliveryDate: new Date('2025-01-10'),
    quantity: 500,
    createdBy: 'user-1',
  }

  describe('createFlockDelivery', () => {
    it('throws when flock not found', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue(null)

      await expect(createFlockDelivery(baseInput)).rejects.toThrow('Flock tidak ditemukan')
    })

    it('throws when flock is retired', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue({
        ...mockFlock,
        retiredAt: new Date('2025-02-01'),
      })

      await expect(createFlockDelivery(baseInput)).rejects.toThrow('sudah pensiun')
    })

    it('allows operator when coop is in assignment', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue(mockFlock)
      vi.mocked(assignmentQueries.findAssignedCoopIds).mockResolvedValue(['coop-1', 'coop-2'])
      vi.mocked(deliveryQueries.insertFlockDelivery).mockResolvedValue(mockDelivery)

      await expect(createFlockDelivery(baseInput, 'operator')).resolves.not.toThrow()
      expect(deliveryQueries.insertFlockDelivery).toHaveBeenCalledOnce()
    })

    it('throws for operator when coop is NOT in assignment', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue(mockFlock)
      vi.mocked(assignmentQueries.findAssignedCoopIds).mockResolvedValue(['coop-99'])

      await expect(createFlockDelivery(baseInput, 'operator')).rejects.toThrow('Akses ditolak')
    })

    it('inserts delivery with correct fields', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue(mockFlock)
      vi.mocked(deliveryQueries.insertFlockDelivery).mockResolvedValue(mockDelivery)

      const result = await createFlockDelivery(
        { ...baseInput, ageAtArrivalDays: 3, notes: 'first batch' },
        'admin'
      )

      expect(deliveryQueries.insertFlockDelivery).toHaveBeenCalledWith(
        expect.objectContaining({
          flockId: 'flock-1',
          quantity: 500,
          ageAtArrivalDays: 3,
          notes: 'first batch',
          createdBy: 'user-1',
        })
      )
      expect(result).toEqual(mockDelivery)
    })

    it('does not check assignment for supervisor role', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue(mockFlock)
      vi.mocked(deliveryQueries.insertFlockDelivery).mockResolvedValue(mockDelivery)

      await createFlockDelivery(baseInput, 'supervisor')

      expect(assignmentQueries.findAssignedCoopIds).not.toHaveBeenCalled()
    })

    it('does not check assignment for admin role', async () => {
      vi.mocked(flockQueries.findFlockById).mockResolvedValue(mockFlock)
      vi.mocked(deliveryQueries.insertFlockDelivery).mockResolvedValue(mockDelivery)

      await createFlockDelivery(baseInput, 'admin')

      expect(assignmentQueries.findAssignedCoopIds).not.toHaveBeenCalled()
    })
  })
})
