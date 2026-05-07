import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq } from 'drizzle-orm'

export async function findCustomerById(farmSchema: string, id: string) {
  const { customers } = getFarmSchema(farmSchema)
  const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1)
  return customer ?? null
}

export async function listCustomers(farmSchema: string) {
  const { customers } = getFarmSchema(farmSchema)
  return db.select().from(customers).orderBy(customers.name)
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertCustomer(farmSchema: string, data: any) {
  const { customers } = getFarmSchema(farmSchema)
  const [customer] = await db.insert(customers).values(data).returning()
  return customer!
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function updateCustomer(farmSchema: string, id: string, data: any) {
  const { customers } = getFarmSchema(farmSchema)
  const [customer] = await db.update(customers).set(data).where(eq(customers.id, id)).returning()
  return customer ?? null
}
