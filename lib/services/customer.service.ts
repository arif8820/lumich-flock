import {
  listCustomers as findAllCustomers,
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

export async function createCustomer(farmSchema: string, input: CreateCustomerInput): Promise<Customer> {
  return insertCustomer(farmSchema, {
    ...input,
    creditLimit: input.creditLimit?.toString() ?? '0',
    status: 'active',
  })
}

export async function getAllCustomers(farmSchema: string): Promise<Customer[]> {
  return findAllCustomers(farmSchema)
}

export async function getCustomerById(farmSchema: string, id: string): Promise<Customer | null> {
  return findCustomerById(farmSchema, id)
}

export async function updateCustomerById(
  farmSchema: string,
  id: string,
  input: Partial<Omit<CreateCustomerInput, 'createdBy'>>
): Promise<Customer | null> {
  return updateCustomer(farmSchema, id, {
    ...input,
    creditLimit: input.creditLimit !== undefined ? input.creditLimit.toString() : undefined,
  })
}

export async function deactivateCustomer(farmSchema: string, id: string): Promise<void> {
  await updateCustomer(farmSchema, id, { status: 'inactive' })
}

export async function activateCustomer(farmSchema: string, id: string): Promise<void> {
  await updateCustomer(farmSchema, id, { status: 'active' })
}
