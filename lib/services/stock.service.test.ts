import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/services/lock-period.service', () => ({
  assertCanEdit: vi.fn(), // no-op by default
}))

vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalance: vi.fn(),
  insertStockAdjustmentWithMovement: vi.fn(),
  findPendingRegradeRequests: vi.fn(),
  findRegradeRequestById: vi.fn(),
  insertRegradeRequest: vi.fn(),
  updateRegradeRequestStatus: vi.fn(),
  approveRegradeRequestTx: vi.fn(),
}))

import * as q from '@/lib/db/queries/inventory.queries'
import {
  validateStockNotBelowZero,
  createStockAdjustment,
  submitRegradeRequest,
  approveRegradeRequest,
  rejectRegradeRequest,
} from './stock.service'

describe('stock.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('validateStockNotBelowZero', () => {
    it('throws when adjustment makes stock negative', () => {
      expect(() => validateStockNotBelowZero(100, -101)).toThrow('Stok tidak mencukupi')
    })

    it('allows adjustment to exactly zero', () => {
      expect(() => validateStockNotBelowZero(100, -100)).not.toThrow()
    })
  })

  describe('createStockAdjustment', () => {
    it('checks balance before negative adjustment', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(500)
      vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any) // any: partial mock

      await createStockAdjustment(
        { flockId: 'f1', adjustmentDate: new Date(), grade: 'A', quantity: -30, reason: 'Koreksi' },
        'user-1'
      )

      expect(q.getStockBalance).toHaveBeenCalledWith('f1', 'A')
      expect(q.insertStockAdjustmentWithMovement).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: -30 }),
        expect.objectContaining({ movementType: 'OUT', quantity: 30 })
      )
    })

    it('throws when negative adjustment exceeds balance', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(20)

      await expect(
        createStockAdjustment(
          { flockId: 'f1', adjustmentDate: new Date(), grade: 'A', quantity: -50, reason: 'Koreksi' },
          'user-1'
        )
      ).rejects.toThrow('Stok tidak mencukupi')
    })

    it('always calls balance check even for positive adjustment', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(500)
      vi.mocked(q.insertStockAdjustmentWithMovement).mockResolvedValue({ id: 'adj-1' } as any) // any: partial mock

      await createStockAdjustment(
        { flockId: 'f1', adjustmentDate: new Date(), grade: 'A', quantity: 100, reason: 'Tambah stok' },
        'user-1'
      )

      expect(q.getStockBalance).toHaveBeenCalledWith('f1', 'A')
      expect(q.insertStockAdjustmentWithMovement).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 100 }),
        expect.objectContaining({ movementType: 'IN', quantity: 100 })
      )
    })
  })

  describe('submitRegradeRequest', () => {
    it('throws when gradeFrom equals gradeTo', async () => {
      await expect(
        submitRegradeRequest(
          { flockId: 'f1', gradeFrom: 'A', gradeTo: 'A', quantity: 100, requestDate: new Date() },
          'user-1'
        )
      ).rejects.toThrow('Grade asal dan tujuan tidak boleh sama')
    })

    it('checks source grade balance', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(1000)
      vi.mocked(q.insertRegradeRequest).mockResolvedValue({ id: 'rr-1' } as any) // any: partial mock

      await submitRegradeRequest(
        { flockId: 'f1', gradeFrom: 'A', gradeTo: 'B', quantity: 200, requestDate: new Date() },
        'user-1'
      )

      expect(q.getStockBalance).toHaveBeenCalledWith('f1', 'A')
    })

    it('throws when source grade has insufficient stock', async () => {
      vi.mocked(q.getStockBalance).mockResolvedValue(100)

      await expect(
        submitRegradeRequest(
          { flockId: 'f1', gradeFrom: 'A', gradeTo: 'B', quantity: 500, requestDate: new Date() },
          'user-1'
        )
      ).rejects.toThrow('Stok tidak mencukupi')
    })
  })

  describe('approveRegradeRequest', () => {
    it('throws when request not found', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue(null)
      await expect(approveRegradeRequest('req-1', 'admin-1')).rejects.toThrow('tidak ditemukan')
    })

    it('throws when request already processed', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'APPROVED' } as any) // any: partial mock
      await expect(approveRegradeRequest('req-1', 'admin-1')).rejects.toThrow('sudah diproses')
    })

    it('calls approveRegradeRequestTx for pending requests', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'PENDING' } as any) // any: partial mock
      vi.mocked(q.approveRegradeRequestTx).mockResolvedValue(undefined)

      await approveRegradeRequest('req-1', 'admin-1')

      expect(q.approveRegradeRequestTx).toHaveBeenCalledWith('req-1', 'admin-1')
    })
  })

  describe('rejectRegradeRequest', () => {
    it('throws when request not found', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue(null)
      await expect(rejectRegradeRequest('req-1', 'admin-1')).rejects.toThrow('tidak ditemukan')
    })

    it('updates status to REJECTED', async () => {
      vi.mocked(q.findRegradeRequestById).mockResolvedValue({ id: 'req-1', status: 'PENDING' } as any) // any: partial mock
      vi.mocked(q.updateRegradeRequestStatus).mockResolvedValue(undefined)

      await rejectRegradeRequest('req-1', 'admin-1')

      expect(q.updateRegradeRequestStatus).toHaveBeenCalledWith('req-1', 'REJECTED', 'admin-1')
    })
  })
})
