import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/invoice.queries', () => ({
  getInvoiceWithDetails: vi.fn(),
  updateInvoiceStatus: vi.fn(),
  updateInvoicePaidAmount: vi.fn(),
  getAgingReport: vi.fn(),
}))

vi.mock('@/lib/db/queries/payment.queries', () => ({
  createPayment: vi.fn(),
  sumPaymentsByInvoice: vi.fn(),
}))

vi.mock('@/lib/db/queries/customer-credit.queries', () => ({
  findCreditById: vi.fn(),
  updateCreditUsedAmount: vi.fn(),
  createCustomerCredit: vi.fn(),
}))

vi.mock('@/lib/db/queries/notification.queries', () => ({
  createNotification: vi.fn(),
}))

vi.mock('@/lib/db/queries/sales-order.queries', () => ({
  findSalesOrderItems: vi.fn(),
}))

// Mock db.transaction to immediately invoke callback with a mock tx that has insert
vi.mock('@/lib/db', () => ({
  db: {
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        insert: vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) })),
      })
    ),
    insert: vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) })),
  },
}))

import * as invoiceQueries from '@/lib/db/queries/invoice.queries'
import * as paymentQueries from '@/lib/db/queries/payment.queries'
import * as creditQueries from '@/lib/db/queries/customer-credit.queries'
import * as notificationQueries from '@/lib/db/queries/notification.queries'
import * as salesOrderQueries from '@/lib/db/queries/sales-order.queries'
import { db } from '@/lib/db'
import {
  getInvoiceDetails,
  recordPayment,
  applyCredit,
  getAgingData,
  getInvoiceForPdf,
} from './invoice.service'

const mockInvoice = {
  id: 'inv-1',
  invoiceNumber: 'INV-202604-0001',
  orderId: 'so-1',
  customerId: 'cust-1',
  status: 'sent' as const,
  totalAmount: '1000000',
  paidAmount: '0',
  customer: { id: 'cust-1', name: 'Toko Maju' },
  orderNumber: 'SO-202604-0001',
  payments: [],
  availableCredits: [],
}

describe('invoice.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('recordPayment', () => {
    it('records payment → status becomes partial (paid 500_000, total 1_000_000)', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(paymentQueries.createPayment).mockResolvedValue({} as any)
      vi.mocked(paymentQueries.sumPaymentsByInvoice).mockResolvedValue(500_000)
      vi.mocked(invoiceQueries.updateInvoicePaidAmount).mockResolvedValue(undefined)
      vi.mocked(invoiceQueries.updateInvoiceStatus).mockResolvedValue(undefined)

      const result = await recordPayment(
        'inv-1',
        { amount: 500_000, method: 'cash', paymentDate: new Date() },
        'user-1'
      )

      expect(result.overpayment).toBe(false)
      expect(invoiceQueries.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', 'partial', expect.anything())
    })

    it('records final payment → status becomes paid (paid 1_000_000, total 1_000_000)', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(paymentQueries.createPayment).mockResolvedValue({} as any)
      vi.mocked(paymentQueries.sumPaymentsByInvoice).mockResolvedValue(1_000_000)
      vi.mocked(invoiceQueries.updateInvoicePaidAmount).mockResolvedValue(undefined)
      vi.mocked(invoiceQueries.updateInvoiceStatus).mockResolvedValue(undefined)

      const result = await recordPayment(
        'inv-1',
        { amount: 1_000_000, method: 'transfer', paymentDate: new Date() },
        'user-1'
      )

      expect(result.overpayment).toBe(false)
      expect(invoiceQueries.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', 'paid', expect.anything())
    })

    it('rounding tolerance: paid 999_999, total 1_000_000 → status paid (within Rp1)', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(paymentQueries.createPayment).mockResolvedValue({} as any)
      vi.mocked(paymentQueries.sumPaymentsByInvoice).mockResolvedValue(999_999)
      vi.mocked(invoiceQueries.updateInvoicePaidAmount).mockResolvedValue(undefined)
      vi.mocked(invoiceQueries.updateInvoiceStatus).mockResolvedValue(undefined)

      const result = await recordPayment(
        'inv-1',
        { amount: 999_999, method: 'cash', paymentDate: new Date() },
        'user-1'
      )

      expect(result.overpayment).toBe(false)
      expect(invoiceQueries.updateInvoiceStatus).toHaveBeenCalledWith('inv-1', 'paid', expect.anything())
    })

    it('overpayment detected → returns { overpayment: true, overpaymentAmount: 500 }', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(paymentQueries.createPayment).mockResolvedValue({} as any)
      vi.mocked(paymentQueries.sumPaymentsByInvoice).mockResolvedValue(1_000_500)
      vi.mocked(invoiceQueries.updateInvoicePaidAmount).mockResolvedValue(undefined)
      vi.mocked(invoiceQueries.updateInvoiceStatus).mockResolvedValue(undefined)
      vi.mocked(creditQueries.createCustomerCredit).mockResolvedValue(undefined)
      vi.mocked(notificationQueries.createNotification).mockResolvedValue(undefined)

      const result = await recordPayment(
        'inv-1',
        { amount: 1_000_500, method: 'cash', paymentDate: new Date() },
        'user-1'
      )

      expect(result.overpayment).toBe(true)
      expect(result.overpaymentAmount).toBe(500)
      // Verify query-layer functions were called for customerCredit and notification
      expect(creditQueries.createCustomerCredit).toHaveBeenCalledOnce()
      expect(notificationQueries.createNotification).toHaveBeenCalledOnce()
    })

    it('throws Invoice tidak ditemukan when invoice is null', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(null)

      await expect(
        recordPayment('inv-999', { amount: 100_000, method: 'cash', paymentDate: new Date() }, 'user-1')
      ).rejects.toThrow('Invoice tidak ditemukan')
    })

    it('throws Invoice tidak dapat dibayar pada status ini when status is paid', async () => {
      const paidInvoice = { ...mockInvoice, status: 'paid' as const }
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(paidInvoice as any)

      await expect(
        recordPayment('inv-1', { amount: 100_000, method: 'cash', paymentDate: new Date() }, 'user-1')
      ).rejects.toThrow('Invoice tidak dapat dibayar pada status ini')
    })

    it('throws Invoice tidak dapat dibayar pada status ini when status is cancelled', async () => {
      const cancelledInvoice = { ...mockInvoice, status: 'cancelled' as const }
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(cancelledInvoice as any)

      await expect(
        recordPayment('inv-1', { amount: 100_000, method: 'cash', paymentDate: new Date() }, 'user-1')
      ).rejects.toThrow('Invoice tidak dapat dibayar pada status ini')
    })

    it('throws Invoice tidak dapat dibayar pada status ini when status is draft', async () => {
      const draftInvoice = { ...mockInvoice, status: 'draft' as const }
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(draftInvoice as any)

      await expect(
        recordPayment('inv-1', { amount: 100_000, method: 'cash', paymentDate: new Date() }, 'user-1')
      ).rejects.toThrow('Invoice tidak dapat dibayar pada status ini')
    })
  })

  describe('applyCredit', () => {
    const mockCredit = {
      id: 'credit-1',
      customerId: 'cust-1',
      amount: '500000',
      usedAmount: '0',
      sourceType: 'overpayment' as const,
      sourceInvoiceId: null,
      sourcePaymentId: null,
      notes: null,
      createdAt: new Date(),
    }

    it('applies credit successfully (amount = 200_000, available = 500_000)', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(creditQueries.findCreditById).mockResolvedValue(mockCredit as any)
      vi.mocked(paymentQueries.createPayment).mockResolvedValue({} as any)
      vi.mocked(creditQueries.updateCreditUsedAmount).mockResolvedValue(undefined)
      vi.mocked(paymentQueries.sumPaymentsByInvoice).mockResolvedValue(200_000)
      vi.mocked(invoiceQueries.updateInvoicePaidAmount).mockResolvedValue(undefined)
      vi.mocked(invoiceQueries.updateInvoiceStatus).mockResolvedValue(undefined)

      await expect(applyCredit('inv-1', 'credit-1', 200_000, 'user-1')).resolves.toBeUndefined()
      expect(paymentQueries.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({ method: 'credit', amount: '200000' }),
        expect.anything()
      )
    })

    it('throws Kredit tidak mencukupi (amount = 600_000, available = 500_000)', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(creditQueries.findCreditById).mockResolvedValue(mockCredit as any)

      await expect(applyCredit('inv-1', 'credit-1', 600_000, 'user-1')).rejects.toThrow(
        'Kredit tidak mencukupi'
      )
    })

    it('throws Jumlah kredit tidak valid (amount = 0)', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)

      await expect(applyCredit('inv-1', 'credit-1', 0, 'user-1')).rejects.toThrow(
        'Jumlah kredit tidak valid'
      )
    })

    it('throws Kredit tidak ditemukan when credit is null', async () => {
      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoice as any)
      vi.mocked(creditQueries.findCreditById).mockResolvedValue(null)

      await expect(applyCredit('inv-1', 'credit-999', 100_000, 'user-1')).rejects.toThrow(
        'Kredit tidak ditemukan'
      )
    })
  })

  describe('getAgingData', () => {
    it('returns result from getAgingReport directly', async () => {
      const mockRows = [{ invoiceId: 'inv-1', bucket: '0-7' }]
      vi.mocked(invoiceQueries.getAgingReport).mockResolvedValue(mockRows as any)

      const result = await getAgingData()

      expect(result).toBe(mockRows)
      expect(invoiceQueries.getAgingReport).toHaveBeenCalledOnce()
    })
  })

  describe('getInvoiceForPdf', () => {
    it('returns invoice details with SO items when orderId exists', async () => {
      const mockInvoiceWithOrder = {
        id: 'inv-1',
        invoiceNumber: 'INV-202604-0001',
        orderId: 'so-1',
        customerId: 'cust-1',
        status: 'sent' as const,
        totalAmount: '1000000',
        paidAmount: '0',
        customer: { id: 'cust-1', name: 'Toko A' },
        orderNumber: 'SO-202604-0001',
        payments: [],
        availableCredits: [],
      }
      const mockItems = [
        { id: 'item-1', orderId: 'so-1', itemType: 'egg_grade_a', quantity: 100, unit: 'butir' },
      ]

      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoiceWithOrder as any)
      vi.mocked(salesOrderQueries.findSalesOrderItems).mockResolvedValue(mockItems as any)

      const result = await getInvoiceForPdf('inv-1')

      expect(result.items).toEqual(mockItems)
      expect(salesOrderQueries.findSalesOrderItems).toHaveBeenCalledWith('so-1')
    })

    it('returns empty items array when orderId is null', async () => {
      const mockInvoiceNoOrder = {
        id: 'inv-1',
        invoiceNumber: 'INV-202604-0001',
        orderId: null,
        customerId: 'cust-1',
        status: 'sent' as const,
        totalAmount: '1000000',
        paidAmount: '0',
        customer: { id: 'cust-1', name: 'Toko A' },
        orderNumber: null,
        payments: [],
        availableCredits: [],
      }

      vi.mocked(invoiceQueries.getInvoiceWithDetails).mockResolvedValue(mockInvoiceNoOrder as any)

      const result = await getInvoiceForPdf('inv-1')

      expect(result.items).toEqual([])
      expect(salesOrderQueries.findSalesOrderItems).not.toHaveBeenCalled()
    })
  })
})
