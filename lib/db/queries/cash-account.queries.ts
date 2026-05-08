import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, sql } from 'drizzle-orm'

export async function listAccounts(farmSchema: string) {
  const { cashAccounts } = getFarmSchema(farmSchema)
  return db.select().from(cashAccounts).where(eq(cashAccounts.isActive, true)).orderBy(cashAccounts.name)
}

export async function findAccountById(farmSchema: string, id: string) {
  const { cashAccounts } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(cashAccounts).where(eq(cashAccounts.id, id)).limit(1)
  return row ?? null
}

export async function createAccount(farmSchema: string, input: { name: string; type: 'cash' | 'bank' | 'ewallet'; beginningBalance?: string }) {
  const { cashAccounts } = getFarmSchema(farmSchema)
  const [row] = await db.insert(cashAccounts).values(input).returning()
  return row!
}

export async function updateAccount(farmSchema: string, id: string, input: { name?: string; type?: 'cash' | 'bank' | 'ewallet'; beginningBalance?: string; isActive?: boolean }) {
  const { cashAccounts } = getFarmSchema(farmSchema)
  const [row] = await db.update(cashAccounts).set(input).where(eq(cashAccounts.id, id)).returning()
  return row ?? null
}

export async function getAccountBalance(farmSchema: string, id: string): Promise<number> {
  const { cashAccounts, cashTransactions } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({
      balance: sql<number>`
        CAST(${cashAccounts.beginningBalance} AS NUMERIC)
        + COALESCE(SUM(CAST(${cashTransactions.amount} AS NUMERIC)) FILTER (WHERE ${cashTransactions.type} IN ('in', 'transfer_in')), 0)
        - COALESCE(SUM(CAST(${cashTransactions.amount} AS NUMERIC)) FILTER (WHERE ${cashTransactions.type} IN ('out', 'transfer_out')), 0)
      `,
    })
    .from(cashAccounts)
    .leftJoin(cashTransactions, eq(cashTransactions.accountId, cashAccounts.id))
    .where(eq(cashAccounts.id, id))
    .groupBy(cashAccounts.id, cashAccounts.beginningBalance)

  return Number(row?.balance ?? 0)
}

export async function countTransactionsByAccount(farmSchema: string, id: string): Promise<number> {
  const { cashTransactions } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({ cnt: sql<number>`COUNT(*)` })
    .from(cashTransactions)
    .where(eq(cashTransactions.accountId, id))
  return Number(row?.cnt ?? 0)
}

