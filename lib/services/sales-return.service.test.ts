import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/sales-order.queries', () => ({
  findSalesOrderById: vi.fn(),
  findSalesOrderItems: vi.fn(),
  countSalesOrdersThisMonth: vi.fn(),
  insertSalesOrderWithItems: vi.fn(),
  updateSalesOrderStatus: vi.fn(),
  deleteDraftSO: vi.fn(),
  fulfillSOTx: vi.fn(),
  getCustomerOutstandingCredit: vi.fn(),
  listSalesOrders: vi.fn(),
}))

vi.mock('@/lib/db/queries/sales-return.queries', () => ({
  findSalesReturnById: vi.fn(),
  findSalesReturnItems: vi.fn(),
  countSalesReturnsThisMonth: vi.fn(),
  insertSalesReturnWithItems: vi.fn(),
  approveSalesReturnTx: vi.fn(),
  rejectSalesReturn: vi.fn(),
  listSalesReturns: vi.fn(),
}))

vi.mock('@/lib/db/queries/invoice.queries', () => ({
  countInvoicesThisMonth: vi.fn(),
  findInvoiceByOrderId: vi.fn(),
}))

import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import * as salesReturnQueries from '@/lib/db/queries/sales-return.queries'
import * as invoiceQueries from '@/lib/db/queries/invoice.queries'
import {
  createSalesReturn,
  approveSalesReturn,
  rejectSalesReturn,
} from './sales-return.service'

type CreateReturnInput = {
  orderId: string
  returnDate: Date
  reasonType: 'wrong_grade' | 'damaged' | 'quantity_error' | 'other'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
  }>
  notes?: string
}

describe('sales-return.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createSalesReturn', () => {
    const mockFulfilledSO = {
      id: 'so-1',
      orderNumber: 'SO-202604-0001',
      customerId: 'cust-1',
      status: 'fulfilled' as const,
    }

    const mockSOItems = [
      {
        id: 'item-1',
        order_id: 'so-1',
        itemType: 'egg_grade_a' as const,
        quantity: 1000,
        unit: 'butir' as const,
      },
    ]

    it('creates sales return with valid input', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockFulfilledSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)
      vi.mocked(salesReturnQueries.countSalesReturnsThisMonth).mockResolvedValue(0)
      vi.mocked(salesReturnQueries.insertSalesReturnWithItems).mockResolvedValue({
        id: 'rt-1',
        returnNumber: 'RTN-202604-0001',
        orderId: 'so-1',
        status: 'pending',
      } as any)

      const input: CreateReturnInput = {
        orderId: 'so-1',
        returnDate: new Date('2026-04-23'),
        reasonType: 'damaged',
        items: [
          {
            itemType: 'egg_grade_a',
            quantity: 100,
            unit: 'butir',
          },
        ],
      }

      const result = await createSalesReturn(input, 'user-1', 'supervisor')

      expect(salesReturnQueries.insertSalesReturnWithItems).toHaveBeenCalled()
      expect(result.returnNumber).toBe('RTN-202604-0001')
    })

    it('throws when return quantity exceeds original SO quantity', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockFulfilledSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)

      const input: CreateReturnInput = {
        orderId: 'so-1',
        returnDate: new Date('2026-04-23'),
        reasonType: 'damaged',
        items: [
          {
            itemType: 'egg_grade_a',
            quantity: 2000,
            unit: 'butir',
          },
        ],
      }

      await expect(createSalesReturn(input, 'user-1', 'supervisor')).rejects.toThrow(
        'Jumlah return melebihi jumlah SO asli'
      )
    })

    it('throws when SO is not fulfilled', async () => {
      const mockConfirmedSO = { ...mockFulfilledSO, status: 'confirmed' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)

      const input: CreateReturnInput = {
        orderId: 'so-1',
        returnDate: new Date('2026-04-23'),
        reasonType: 'damaged',
        items: [
          {
            itemType: 'egg_grade_a',
            quantity: 100100,
            unit: 'butir',
          },
        ],
      }

      await expect(createSalesReturn(input, 'user-1', 'supervisor')).rejects.toThrow(
        'Return hanya bisa dibuat untuk SO yang sudah fulfilled'
      )
    })

    it('throws for operator role', async () => {
      await expect(
        createSalesReturn(
          {
            orderId: 'so-1',
            returnDate: new Date('2026-04-23'),
            reasonType: 'damaged',
            items: [],
          },
          'user-1',
          'operator' as any
        )
      ).rejects.toThrow('Akses ditolak')
    })
  })

  describe('approveSalesReturn', () => {
    const mockPendingReturn = {
      id: 'rt-1',
      returnNumber: 'RTN-202604-0001',
      orderId: 'so-1',
      customerId: 'cust-1',
      status: 'pending' as const,
    }

    const mockReturnItems = [
      {
        id: 'rti-1',
        return_id: 'rt-1',
        itemType: 'egg_grade_a' as const,
        quantity: 100,
        unit: 'butir' as const,
      },
    ]

    it('approves pending return - creates inventory IN, credit note invoice, customer credits', async () => {
      vi.mocked(salesReturnQueries.findSalesReturnById).mockResolvedValue(mockPendingReturn as any)
      vi.mocked(salesReturnQueries.findSalesReturnItems).mockResolvedValue(mockReturnItems as any)
      vi.mocked(salesReturnQueries.approveSalesReturnTx).mockResolvedValue(undefined)

      await approveSalesReturn('rt-1', 'admin-1', 'admin')

      expect(salesReturnQueries.approveSalesReturnTx).toHaveBeenCalledWith(
        'rt-1',
        'admin-1',
        expect.any(Array),
        expect.any(Object),
        expect.any(Object)
      )
    })

    it('throws for non-admin role', async () => {
      await expect(approveSalesReturn('rt-1', 'supervisor-1', 'supervisor')).rejects.toThrow(
        'Akses ditolak'
      )
    })

    it('throws when return is not pending', async () => {
      const mockApprovedReturn = { ...mockPendingReturn, status: 'approved' as const }
      vi.mocked(salesReturnQueries.findSalesReturnById).mockResolvedValue(mockApprovedReturn as any)

      await expect(approveSalesReturn('rt-1', 'admin-1', 'admin')).rejects.toThrow(
        'Status return tidak valid untuk operasi ini'
      )
    })
  })

  describe('rejectSalesReturn', () => {
    const mockPendingReturn = {
      id: 'rt-1',
      returnNumber: 'RTN-202604-0001',
      orderId: 'so-1',
      customerId: 'cust-1',
      status: 'pending' as const,
    }

    it('rejects pending return - no inventory or finance changes', async () => {
      vi.mocked(salesReturnQueries.findSalesReturnById).mockResolvedValue(mockPendingReturn as any)
      vi.mocked(salesReturnQueries.rejectSalesReturn).mockResolvedValue(undefined)

      await rejectSalesReturn('rt-1', 'admin-1', 'admin')

      expect(salesReturnQueries.rejectSalesReturn).toHaveBeenCalledWith('rt-1', 'admin-1')
    })

    it('throws for non-admin role', async () => {
      await expect(rejectSalesReturn('rt-1', 'supervisor-1', 'supervisor')).rejects.toThrow(
        'Akses ditolak'
      )
    })

    it('throws when return is not pending', async () => {
      const mockApprovedReturn = { ...mockPendingReturn, status: 'approved' as const }
      vi.mocked(salesReturnQueries.findSalesReturnById).mockResolvedValue(mockApprovedReturn as any)

      await expect(rejectSalesReturn('rt-1', 'admin-1', 'admin')).rejects.toThrow(
        'Status return tidak valid untuk operasi ini'
      )
    })
  })
})
