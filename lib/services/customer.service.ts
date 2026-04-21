import {
  findAllCustomers,
  findCustomerById,
  insertCustomer,
  updateCustomer,
} from '@/lib/db/queries/customer.queries'
import type { Customer } from '@/lib/db/schema'

type CreateCustomerInput = {
  name: string
  type?: 'retail' | 'wholesale' | 'distributor'
  phone?: string
  address?: string
  creditLimit?: number
  paymentTerms?: number
  notes?: string
  createdBy: string
}

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  return insertCustomer({
    ...input,
    creditLimit: input.creditLimit?.toString() ?? '0',
    status: 'active',
  })
}

export async function getAllCustomers(): Promise<Customer[]> {
  return findAllCustomers()
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  return findCustomerById(id)
}

export async function updateCustomerById(
  id: string,
  input: Partial<Omit<CreateCustomerInput, 'createdBy'>>
): Promise<Customer | null> {
  return updateCustomer(id, {
    ...input,
    creditLimit: input.creditLimit !== undefined ? input.creditLimit.toString() : undefined,
  })
}

export async function deactivateCustomer(id: string): Promise<void> {
  await updateCustomer(id, { status: 'inactive' })
}

export async function activateCustomer(id: string): Promise<void> {
  await updateCustomer(id, { status: 'active' })
}
