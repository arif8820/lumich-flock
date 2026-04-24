import { db, DrizzleTx } from '@/lib/db'
import { customerCredits } from '@/lib/db/schema'
import { eq, sql, desc, and } from 'drizzle-orm'
import type { CustomerCredit } from '@/lib/db/schema'

export async function listCreditsByCustomer(customerId: string): Promise<CustomerCredit[]> {
  return db
    .select()
    .from(customerCredits)
    .where(eq(customerCredits.customerId, customerId))
    .orderBy(desc(customerCredits.createdAt))
}

export async function getAvailableCredit(customerId: string): Promise<number> {
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

export async function findCreditById(id: string, tx?: DrizzleTx): Promise<CustomerCredit | null> {
  const executor = tx ?? db
  const [row] = await executor
    .select()
    .from(customerCredits)
    .where(eq(customerCredits.id, id))
    .limit(1)
  return row ?? null
}

export async function updateCreditUsedAmount(
  creditId: string,
  additionalUsed: number,
  tx?: DrizzleTx
): Promise<void> {
  const executor = tx ?? db
  await executor
    .update(customerCredits)
    .set({ usedAmount: sql`${customerCredits.usedAmount} + ${additionalUsed}` })
    .where(eq(customerCredits.id, creditId))
}
