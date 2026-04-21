import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/coop.queries', () => ({
  findAllCoops: vi.fn(),
  findCoopById: vi.fn(),
  insertCoop: vi.fn(),
  updateCoop: vi.fn(),
  deleteCoop: vi.fn(),
}))

import * as coopQueries from '@/lib/db/queries/coop.queries'
import { createCoop, getAllCoops, deactivateCoop } from './coop.service'

describe('coop.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createCoop', () => {
    it('inserts coop with active status', async () => {
      vi.mocked(coopQueries.insertCoop).mockResolvedValue({
        id: 'coop-1',
        name: 'Kandang A',
        capacity: 5000,
        status: 'active',
        notes: null,
        createdAt: new Date(),
        updatedAt: null,
      })

      const result = await createCoop({ name: 'Kandang A', capacity: 5000 })

      expect(coopQueries.insertCoop).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Kandang A', status: 'active' })
      )
      expect(result.name).toBe('Kandang A')
    })
  })

  describe('deactivateCoop', () => {
    it('sets status to inactive', async () => {
      vi.mocked(coopQueries.updateCoop).mockResolvedValue({ id: 'coop-1', status: 'inactive' } as any) // any: partial Coop for mock

      await deactivateCoop('coop-1')

      expect(coopQueries.updateCoop).toHaveBeenCalledWith('coop-1', { status: 'inactive' })
    })
  })
})
