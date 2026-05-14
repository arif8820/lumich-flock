import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { and, desc, gte, lte, sql } from 'drizzle-orm'

export type CashFlowRow = {
  id: string
  transactionDate: string
  description: string
  type: string
  amount: number
  accountName: string
  categoryName: string | null
}

export type CashFlowReport = {
  rows: CashFlowRow[]
  totalIn: number
  totalOut: number
  netFlow: number
}

export async function getCashFlowReport(
  farmSchema: string,
  from: string,
  to: string
): Promise<CashFlowReport> {
  const { cashTransactions, cashAccounts, cashCategories } = getFarmSchema(farmSchema)

  const fromDate = new Date(from)
  const toDate = new Date(to)

  const rawRows = await db
    .select({
      id: cashTransactions.id,
      transactionDate: cashTransactions.transactionDate,
      description: cashTransactions.description,
      type: cashTransactions.type,
      amount: cashTransactions.amount,
      accountName: cashAccounts.name,
      categoryName: cashCategories.name,
    })
    .from(cashTransactions)
    .leftJoin(cashAccounts, sql`${cashTransactions.accountId} = ${cashAccounts.id}`)
    .leftJoin(cashCategories, sql`${cashTransactions.categoryId} = ${cashCategories.id}`)
    .where(
      and(
        gte(cashTransactions.transactionDate, fromDate),
        lte(cashTransactions.transactionDate, toDate)
      )
    )
    .orderBy(desc(cashTransactions.transactionDate), desc(cashTransactions.createdAt))

  const rows: CashFlowRow[] = rawRows.map((r) => ({
    id: r.id,
    transactionDate: r.transactionDate instanceof Date
      ? r.transactionDate.toISOString().split('T')[0]!
      : String(r.transactionDate),
    description: r.description ?? '',
    type: r.type,
    amount: Number(r.amount),
    accountName: r.accountName ?? '',
    categoryName: r.categoryName ?? null,
  }))

  const totalIn = rows
    .filter((r) => r.type === 'in' || r.type === 'transfer_in')
    .reduce((sum, r) => sum + r.amount, 0)

  const totalOut = rows
    .filter((r) => r.type === 'out' || r.type === 'transfer_out')
    .reduce((sum, r) => sum + r.amount, 0)

  return {
    rows,
    totalIn,
    totalOut,
    netFlow: totalIn - totalOut,
  }
}
