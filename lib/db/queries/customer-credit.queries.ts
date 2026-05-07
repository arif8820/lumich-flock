import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql, desc, and } from 'drizzle-orm'

export async function listCreditsByCustomer(farmSchema: string, customerId: string) {
  const { customerCredits } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(customerCredits)
    .where(eq(customerCredits.customerId, customerId))
    .orderBy(desc(customerCredits.createdAt))
}

export async function getAvailableCredit(farmSchema: string, customerId: string): Promise<number> {
  const { customerCredits } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${customerCredits.amount} - ${customerCredits.usedAmount}), 0)`,
    })
    .from(customerCredits)
    .where(
      and(
        eq(customerCredits.customerId, customerId),
        sql`${customerCredits.amount} > ${customerCredits.usedAmount}`
      )
    )
  return Number(row?.total ?? 0)
}

export async function findCreditById(farmSchema: string, id: string, tx?: DrizzleTx) {
  const { customerCredits } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  const [row] = await executor
    .select()
    .from(customerCredits)
    .where(eq(customerCredits.id, id))
    .limit(1)
  return row ?? null
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function createCustomerCredit(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credit: any,
  tx?: DrizzleTx
): Promise<void> {
  const { customerCredits } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  await executor.insert(customerCredits).values(credit)
}

export async function updateCreditUsedAmount(
  farmSchema: string,
  creditId: string,
  additionalUsed: number,
  tx?: DrizzleTx
): Promise<void> {
  const { customerCredits } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  await executor
    .update(customerCredits)
    .set({ usedAmount: sql`${customerCredits.usedAmount} + ${additionalUsed}` })
    .where(eq(customerCredits.id, creditId))
}
