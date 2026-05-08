import { db, DrizzleTx } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, gte, lte, sql, getTableColumns } from 'drizzle-orm'

export type TransactionFilter = {
  accountId?: string
  type?: 'in' | 'out' | 'transfer_in' | 'transfer_out'
  categoryId?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}

export async function listTransactions(farmSchema: string, filter: TransactionFilter = {}) {
  const { cashTransactions, cashAccounts, cashCategories } = getFarmSchema(farmSchema)

  const conditions = [
    filter.accountId ? eq(cashTransactions.accountId, filter.accountId) : undefined,
    // any: Drizzle enum type inference
    filter.type ? eq(cashTransactions.type, filter.type as any) : undefined,
    filter.categoryId ? eq(cashTransactions.categoryId, filter.categoryId) : undefined,
    filter.dateFrom ? gte(cashTransactions.transactionDate, filter.dateFrom) : undefined,
    filter.dateTo ? lte(cashTransactions.transactionDate, filter.dateTo) : undefined,
  ].filter(Boolean)

  const whereClause = conditions.length > 0 ? and(...(conditions as Parameters<typeof and>)) : sql`1=1`

  return db
    .select({
      ...getTableColumns(cashTransactions),
      accountName: cashAccounts.name,
      categoryName: cashCategories.name,
    })
    .from(cashTransactions)
    .leftJoin(cashAccounts, eq(cashTransactions.accountId, cashAccounts.id))
    .leftJoin(cashCategories, eq(cashTransactions.categoryId, cashCategories.id))
    .where(whereClause)
    .orderBy(desc(cashTransactions.transactionDate), desc(cashTransactions.createdAt))
    .limit(filter.limit ?? 50)
    .offset(filter.offset ?? 0)
}

export async function insertTransaction(
  farmSchema: string,
  input: {
    accountId: string
    type: 'in' | 'out' | 'transfer_in' | 'transfer_out'
    amount: string
    transactionDate: Date
    categoryId?: string | null
    referenceNumber?: string | null
    description?: string | null
    transferRefId?: string | null
    sourceType?: string | null
    sourceId?: string | null
    createdBy: string
  },
  tx?: DrizzleTx
) {
  const { cashTransactions } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  const [row] = await executor.insert(cashTransactions).values(input).returning()
  return row!
}

export async function updateTransferRefId(
  farmSchema: string,
  id: string,
  transferRefId: string,
  tx?: DrizzleTx
) {
  const { cashTransactions } = getFarmSchema(farmSchema)
  const executor = tx ?? db
  await executor
    .update(cashTransactions)
    .set({ transferRefId })
    .where(eq(cashTransactions.id, id))
}

export type DailyReportRow = {
  transactionDate: Date
  beginningBalance: number
  totalIn: number
  totalOut: number
  endingBalance: number
}

export async function getDailyReport(
  farmSchema: string,
  accountId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<DailyReportRow[]> {
  const { cashTransactions, cashAccounts } = getFarmSchema(farmSchema)

  const [accountRow] = await db
    .select({ beginningBalance: cashAccounts.beginningBalance })
    .from(cashAccounts)
    .where(eq(cashAccounts.id, accountId))
    .limit(1)

  const beginningBalance = Number(accountRow?.beginningBalance ?? 0)

  const rows = await db
    .select({
      transactionDate: cashTransactions.transactionDate,
      totalIn: sql<number>`COALESCE(SUM(CAST(${cashTransactions.amount} AS NUMERIC)) FILTER (WHERE ${cashTransactions.type} IN ('in', 'transfer_in')), 0)`,
      totalOut: sql<number>`COALESCE(SUM(CAST(${cashTransactions.amount} AS NUMERIC)) FILTER (WHERE ${cashTransactions.type} IN ('out', 'transfer_out')), 0)`,
    })
    .from(cashTransactions)
    .where(
      and(
        eq(cashTransactions.accountId, accountId),
        gte(cashTransactions.transactionDate, dateFrom),
        lte(cashTransactions.transactionDate, dateTo)
      )
    )
    .groupBy(cashTransactions.transactionDate)
    .orderBy(cashTransactions.transactionDate)

  const [priorRow] = await db
    .select({
      priorBalance: sql<number>`
        COALESCE(SUM(CAST(${cashTransactions.amount} AS NUMERIC)) FILTER (WHERE ${cashTransactions.type} IN ('in', 'transfer_in')), 0)
        - COALESCE(SUM(CAST(${cashTransactions.amount} AS NUMERIC)) FILTER (WHERE ${cashTransactions.type} IN ('out', 'transfer_out')), 0)
      `,
    })
    .from(cashTransactions)
    .where(
      and(
        eq(cashTransactions.accountId, accountId),
        sql`${cashTransactions.transactionDate} < ${dateFrom}`
      )
    )

  let runningBalance = beginningBalance + Number(priorRow?.priorBalance ?? 0)

  return rows.map((row) => {
    const totalIn = Number(row.totalIn)
    const totalOut = Number(row.totalOut)
    const dayBeginning = runningBalance
    runningBalance = runningBalance + totalIn - totalOut
    return {
      transactionDate: row.transactionDate,
      beginningBalance: dayBeginning,
      totalIn,
      totalOut,
      endingBalance: runningBalance,
    }
  })
}
