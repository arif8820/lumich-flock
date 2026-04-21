import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db/queries/customer.queries', () => ({
  findAllCustomers: vi.fn(),
  findCustomerById: vi.fn(),
  insertCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}))

import * as customerQueries from '@/lib/db/queries/customer.queries'
import { createCustomer, deactivateCustomer } from './customer.service'

describe('customer.service', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('createCustomer', () => {
    it('inserts customer with active status', async () => {
      vi.mocked(customerQueries.insertCustomer).mockResolvedValue({
        id: 'cust-1',
        name: 'Toko Maju',
        type: 'retail',
        status: 'active',
        creditLimit: '0',
        paymentTerms: 0,
        phone: null,
        address: null,
        notes: null,
        createdBy: 'admin-id',
        createdAt: new Date(),
        updatedAt: null,
      })

      const result = await createCustomer({
        name: 'Toko Maju',
        type: 'retail',
        createdBy: 'admin-id',
      })

      expect(customerQueries.insertCustomer).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Toko Maju', status: 'active' })
      )
      expect(result.name).toBe('Toko Maju')
    })
  })

  describe('deactivateCustomer', () => {
    it('sets status to inactive', async () => {
      vi.mocked(customerQueries.updateCustomer).mockResolvedValue({ id: 'cust-1', status: 'inactive' } as any) // any: partial Customer for mock

      await deactivateCustomer('cust-1')

      expect(customerQueries.updateCustomer).toHaveBeenCalledWith('cust-1', { status: 'inactive' })
    })
  })
})
