import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { Customer, NewCustomer } from '@/lib/db/schema'

export async function findCustomerById(id: string): Promise<Customer | null> {
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  return customer ?? null
}

export async function listCustomers(): Promise<Customer[]> {
  return db.select().from(customers).orderBy(customers.name)
}

export async function insertCustomer(data: NewCustomer): Promise<Customer> {
  const [customer] = await db.insert(customers).values(data).returning()
  return customer!
}

export async function updateCustomer(id: string, data: Partial<NewCustomer>): Promise<Customer | null> {
  const [customer] = await db.update(customers).set(data).where(eq(customers.id, id)).returning()
  return customer ?? null
}
