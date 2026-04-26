import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/customer.queries', () => ({
  findCustomerById: vi.fn(),
  listCustomers: vi.fn(),
}))

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

vi.mock('@/lib/db/queries/inventory.queries', () => ({
  getStockBalance: vi.fn(),
  getStockBalanceByGrade: vi.fn(),
  getAllStockBalances: vi.fn(),
  insertStockAdjustmentWithMovement: vi.fn(),
  findPendingRegradeRequests: vi.fn(),
  findRegradeRequestById: vi.fn(),
  insertRegradeRequest: vi.fn(),
  updateRegradeRequestStatus: vi.fn(),
  approveRegradeRequestTx: vi.fn(),
}))

vi.mock('@/lib/db/queries/invoice.queries', () => ({
  countInvoicesThisMonth: vi.fn().mockResolvedValue(0),
}))

import * as customerQueries from '@/lib/db/queries/customer.queries'
import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import * as inventoryQueries from '@/lib/db/queries/inventory.queries'
import * as invoiceQueries from '@/lib/db/queries/invoice.queries'
import {
  createDraftSO,
  confirmSO,
  cancelSO,
  deleteDraftSO,
  fulfillSO,
} from './sales-order.service'

type CreateDraftInput = {
  customerId: string
  orderDate: Date
  paymentMethod: 'cash' | 'credit'
  items: Array<{
    itemType: 'egg_grade_a' | 'egg_grade_b' | 'flock' | 'other'
    itemRefId?: string
    description?: string
    quantity: number
    unit: 'butir' | 'ekor' | 'unit'
    pricePerUnit: number
    discountPct?: number

  }>
  taxPct?: number
  notes?: string
  overrideReason?: string
}

describe('sales-order.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createDraftSO', () => {
    const mockCustomer = {
      id: 'cust-1',
      name: 'Toko Maju',
      type: 'retail' as const,
      status: 'active' as const,
      creditLimit: '10000000',
      paymentTerms: 30,
      phone: null,
      address: null,
      notes: null,
      createdBy: 'admin-id',
      createdAt: new Date(),
      updatedAt: null,
    }

    const mockItems: CreateDraftInput['items'] = [
      {
        itemType: 'egg_grade_a',
        quantity: 1000,
        unit: 'butir',
        pricePerUnit: 1500,
      },
    ]

    it('creates draft SO with valid input', async () => {
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(mockCustomer)
      vi.mocked(salesOrderQueries.countSalesOrdersThisMonth).mockResolvedValue(0)
      vi.mocked(salesOrderQueries.insertSalesOrderWithItems).mockResolvedValue({
        id: 'so-1',
        orderNumber: 'SO-202604-0001',
        customerId: 'cust-1',
        status: 'draft',
        totalAmount: '1500000',
      } as any)

      const result = await createDraftSO(
        {
          customerId: 'cust-1',
          orderDate: new Date('2026-04-23'),
          paymentMethod: 'cash',
          items: mockItems,
        },
        'user-1',
        'supervisor'
      )

      expect(customerQueries.findCustomerById).toHaveBeenCalledWith('cust-1')
      expect(salesOrderQueries.insertSalesOrderWithItems).toHaveBeenCalled()
      expect(result.orderNumber).toBe('SO-202604-0001')
    })

    it('throws when customer is blocked without override', async () => {
      const blockedCustomer = { ...mockCustomer, status: 'blocked' as const }
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(blockedCustomer)

      await expect(
        createDraftSO(
          {
            customerId: 'cust-1',
            orderDate: new Date('2026-04-23'),
            paymentMethod: 'cash',
            items: mockItems,
          },
          'user-1',
          'supervisor'
        )
      ).rejects.toThrow('Pelanggan diblokir')
    })

    it('creates SO for blocked customer with admin override', async () => {
      const blockedCustomer = { ...mockCustomer, status: 'blocked' as const }
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(blockedCustomer)
      vi.mocked(salesOrderQueries.countSalesOrdersThisMonth).mockResolvedValue(0)
      vi.mocked(salesOrderQueries.insertSalesOrderWithItems).mockResolvedValue({
        id: 'so-1',
        orderNumber: 'SO-202604-0001',
        customerId: 'cust-1',
        status: 'draft',
        totalAmount: '1500000',
      } as any)

      const result = await createDraftSO(
        {
          customerId: 'cust-1',
          orderDate: new Date('2026-04-23'),
          paymentMethod: 'cash',
          items: mockItems,
          overrideReason: 'Override untuk pelanggan lama',
        },
        'user-1',
        'admin'
      )

      expect(salesOrderQueries.insertSalesOrderWithItems).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: expect.stringContaining('Override untuk pelanggan lama'),
        }),
        expect.anything()
      )
    })

    it('throws when items array is empty', async () => {
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(mockCustomer)

      await expect(
        createDraftSO(
          {
            customerId: 'cust-1',
            orderDate: new Date('2026-04-23'),
            paymentMethod: 'cash',
            items: [],
          },
          'user-1',
          'supervisor'
        )
      ).rejects.toThrow('Item tidak boleh kosong')
    })

    it('throws for operator role', async () => {
      await expect(
        createDraftSO(
          {
            customerId: 'cust-1',
            orderDate: new Date('2026-04-23'),
            paymentMethod: 'cash',
            items: mockItems,
          },
          'user-1',
          'operator' as any
        )
      ).rejects.toThrow('Akses ditolak')
    })
  })

  describe('confirmSO', () => {
    const mockDraftSO = {
      id: 'so-1',
      orderNumber: 'SO-202604-0001',
      status: 'draft' as const,
    }

    it('confirms draft SO', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockDraftSO as any)

      const result = await confirmSO('so-1', 'user-1', 'supervisor')

      expect(salesOrderQueries.updateSalesOrderStatus).toHaveBeenCalledWith('so-1', 'confirmed', 'user-1')
    })

    it('throws when SO is not draft', async () => {
      const mockConfirmedSO = { ...mockDraftSO, status: 'confirmed' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)

      await expect(confirmSO('so-1', 'user-1', 'supervisor')).rejects.toThrow(
        'Status SO tidak valid untuk operasi ini'
      )
    })

    it('throws for operator role', async () => {
      await expect(confirmSO('so-1', 'user-1', 'operator' as any)).rejects.toThrow('Akses ditolak')
    })
  })

  describe('cancelSO', () => {
    const mockConfirmedSO = {
      id: 'so-1',
      orderNumber: 'SO-202604-0001',
      status: 'confirmed' as const,
    }

    it('cancels confirmed SO', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)

      const result = await cancelSO('so-1', 'user-1', 'supervisor')

      expect(salesOrderQueries.updateSalesOrderStatus).toHaveBeenCalledWith('so-1', 'cancelled', 'user-1')
    })

    it('throws when SO is not confirmed', async () => {
      const mockDraftSO = { ...mockConfirmedSO, status: 'draft' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockDraftSO as any)

      await expect(cancelSO('so-1', 'user-1', 'supervisor')).rejects.toThrow(
        'Status SO tidak valid untuk operasi ini'
      )
    })

    it('throws for operator role', async () => {
      await expect(cancelSO('so-1', 'user-1', 'operator' as any)).rejects.toThrow('Akses ditolak')
    })
  })

  describe('deleteDraftSO', () => {
    const mockDraftSO = {
      id: 'so-1',
      orderNumber: 'SO-202604-0001',
      status: 'draft' as const,
    }

    it('deletes draft SO', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockDraftSO as any)
      vi.mocked(salesOrderQueries.deleteDraftSO).mockResolvedValue(undefined)

      await deleteDraftSO('so-1', 'user-1', 'supervisor')

      expect(salesOrderQueries.deleteDraftSO).toHaveBeenCalledWith('so-1')
    })

    it('throws when SO is not draft', async () => {
      const mockConfirmedSO = { ...mockDraftSO, status: 'confirmed' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)

      await expect(deleteDraftSO('so-1', 'user-1', 'supervisor')).rejects.toThrow(
        'Status SO tidak valid untuk operasi ini'
      )
    })

    it('throws for operator role', async () => {
      await expect(deleteDraftSO('so-1', 'user-1', 'operator' as any)).rejects.toThrow('Akses ditolak')
    })
  })

  describe('fulfillSO', () => {
    const mockConfirmedSO = {
      id: 'so-1',
      orderNumber: 'SO-202604-0001',
      customerId: 'cust-1',
      status: 'confirmed' as const,
      paymentMethod: 'cash' as const,
      totalAmount: '1500000',
    }

    const mockCustomer = {
      id: 'cust-1',
      name: 'Toko Maju',
      status: 'active' as const,
      creditLimit: '10000000',
    }

    const mockSOItems = [
      {
        id: 'item-1',
        order_id: 'so-1',
        itemType: 'egg_grade_a' as const,
        quantity: 1000,
        unit: 'butir' as const,
        pricePerUnit: '1500',
      },
    ]

    it('fulfills SO with sufficient stock (cash)', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)
      vi.mocked(inventoryQueries.getStockBalanceByGrade).mockResolvedValue(5000)
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(mockCustomer as any)
      vi.mocked(salesOrderQueries.fulfillSOTx).mockResolvedValue(undefined)

      await fulfillSO('so-1', 'user-1', 'supervisor')

      expect(salesOrderQueries.fulfillSOTx).toHaveBeenCalled()
    })

    it('throws when stock insufficient', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)
      vi.mocked(inventoryQueries.getStockBalanceByGrade).mockResolvedValue(500)

      await expect(fulfillSO('so-1', 'user-1', 'supervisor')).rejects.toThrow(
        'Stok tidak mencukupi saat transaksi diproses'
      )
    })

    it('throws when credit limit exceeded', async () => {
      const creditSO = { ...mockConfirmedSO, paymentMethod: 'credit' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(creditSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)
      vi.mocked(inventoryQueries.getStockBalanceByGrade).mockResolvedValue(5000)
      vi.mocked(salesOrderQueries.getCustomerOutstandingCredit).mockResolvedValue(9500000)
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(mockCustomer as any)

      await expect(fulfillSO('so-1', 'user-1', 'supervisor')).rejects.toThrow(
        'Credit limit pelanggan terlampaui'
      )
    })

    it('throws for operator role', async () => {
      await expect(fulfillSO('so-1', 'user-1', 'operator' as any)).rejects.toThrow('Akses ditolak')
    })

    it('throws when SO is not confirmed', async () => {
      const mockDraftSO = { ...mockConfirmedSO, status: 'draft' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockDraftSO as any)

      await expect(fulfillSO('so-1', 'user-1', 'supervisor')).rejects.toThrow(
        'Status SO tidak valid untuk operasi ini'
      )
    })

    it('cash SO: invoice number starts with RCP-', async () => {
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(mockConfirmedSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)
      vi.mocked(inventoryQueries.getStockBalanceByGrade).mockResolvedValue(5000)
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(mockCustomer as any)
      vi.mocked(invoiceQueries.countInvoicesThisMonth).mockResolvedValue(0)
      vi.mocked(salesOrderQueries.fulfillSOTx).mockResolvedValue(undefined)

      await fulfillSO('so-1', 'user-1', 'supervisor')

      const invoiceArg = vi.mocked(salesOrderQueries.fulfillSOTx).mock.calls[0][3]
      expect((invoiceArg as any).invoiceNumber).toMatch(/^RCP-/)
    })

    it('credit SO: invoice number starts with INV-', async () => {
      const creditSO = { ...mockConfirmedSO, paymentMethod: 'credit' as const }
      vi.mocked(salesOrderQueries.findSalesOrderById).mockResolvedValue(creditSO as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockSOItems as any)
      vi.mocked(inventoryQueries.getStockBalanceByGrade).mockResolvedValue(5000)
      vi.mocked(salesOrderQueries.getCustomerOutstandingCredit).mockResolvedValue(0)
      vi.mocked(customerQueries.findCustomerById).mockResolvedValue(mockCustomer as any)
      vi.mocked(invoiceQueries.countInvoicesThisMonth).mockResolvedValue(0)
      vi.mocked(salesOrderQueries.fulfillSOTx).mockResolvedValue(undefined)

      await fulfillSO('so-1', 'user-1', 'supervisor')

      const invoiceArg = vi.mocked(salesOrderQueries.fulfillSOTx).mock.calls[0][3]
      expect((invoiceArg as any).invoiceNumber).toMatch(/^INV-/)
    })
  })
})
