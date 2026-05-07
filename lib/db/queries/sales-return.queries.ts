import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, desc, sql, count, getTableColumns } from 'drizzle-orm'

export async function findSalesReturnById(farmSchema: string, id: string) {
  const { salesReturns } = getFarmSchema(farmSchema)
  const [row] = await db.select().from(salesReturns).where(eq(salesReturns.id, id)).limit(1)
  return row ?? null
}

export async function findSalesReturnItems(farmSchema: string, returnId: string) {
  const { salesReturnItems } = getFarmSchema(farmSchema)
  return db.select().from(salesReturnItems).where(eq(salesReturnItems.returnId, returnId))
}

export async function countSalesReturnsThisMonth(farmSchema: string, prefix: string): Promise<number> {
  const { salesReturns } = getFarmSchema(farmSchema)
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ maxSeq: sql<string>`MAX(CAST(SPLIT_PART(${salesReturns.returnNumber}, '-', 3) AS INTEGER))` })
    .from(salesReturns)
    .where(sql`${salesReturns.returnNumber} LIKE ${pattern}`)
  return row?.maxSeq ? parseInt(row.maxSeq) : 0
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertSalesReturnWithItems(
  farmSchema: string,
  ret: any,
  items: any[]
) {
  const { salesReturns, salesReturnItems } = getFarmSchema(farmSchema)
  return db.transaction(async (tx) => {
    const [sr] = await tx.insert(salesReturns).values(ret).returning()
    if (items.length > 0) {
      await tx.insert(salesReturnItems).values(items.map((i: any) => ({ ...i, returnId: sr!.id })))
    }
    return sr!
  })
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function approveSalesReturnTx(
  farmSchema: string,
  returnId: string,
  userId: string,
  movements: any[],
  creditNoteInvoice: any,
  customerCredit: any
): Promise<void> {
  const { salesReturns, inventoryMovements, invoices, customerCredits } = getFarmSchema(farmSchema)
  await db.transaction(async (tx) => {
    const [sr] = await tx
      .select()
      .from(salesReturns)
      .where(eq(salesReturns.id, returnId))
      .limit(1)

    if (!sr) throw new Error('Return not found')
    if (sr.status !== 'pending') throw new Error('Return sudah diproses')

    // Insert inventory movements
    for (const mv of movements) {
      await tx.insert(inventoryMovements).values(mv)
    }

    // Insert credit note invoice
    const [insertedInvoice] = await tx.insert(invoices).values(creditNoteInvoice).returning()

    // Insert customer credit with created invoice id
    await tx.insert(customerCredits).values({
      ...customerCredit,
      sourceInvoiceId: insertedInvoice!.id,
    })

    // Update return status
    await tx
      .update(salesReturns)
      .set({ status: 'approved', reviewedBy: userId, reviewedAt: new Date() })
      .where(eq(salesReturns.id, returnId))
  })
}

export async function rejectSalesReturn(
  farmSchema: string,
  returnId: string,
  userId: string
): Promise<void> {
  const { salesReturns } = getFarmSchema(farmSchema)
  await db
    .update(salesReturns)
    .set({ status: 'rejected', reviewedBy: userId, reviewedAt: new Date() })
    .where(eq(salesReturns.id, returnId))
}

export async function findSalesReturnsByOrderId(farmSchema: string, orderId: string) {
  const { salesReturns } = getFarmSchema(farmSchema)
  return db
    .select()
    .from(salesReturns)
    .where(eq(salesReturns.orderId, orderId))
    .orderBy(desc(salesReturns.createdAt))
}

export async function listSalesReturnsWithOrder(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
) {
  const { salesReturns, salesOrders } = getFarmSchema(farmSchema)
  const conditions = status
    ? eq(salesReturns.status, status as 'pending' | 'approved' | 'rejected')
    : undefined
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(salesReturns)
    .where(whereClause)

  const rows = await db
    .select({ ...getTableColumns(salesReturns), orderNumber: salesOrders.orderNumber })
    .from(salesReturns)
    .leftJoin(salesOrders, eq(salesReturns.orderId, salesOrders.id))
    .where(whereClause)
    .orderBy(desc(salesReturns.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { data: rows as any[], total: countRow?.cnt ?? 0 }
}

export async function listSalesReturns(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
) {
  const { salesReturns } = getFarmSchema(farmSchema)
  const conditions = status
    ? eq(salesReturns.status, status as 'pending' | 'approved' | 'rejected')
    : undefined
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(salesReturns)
    .where(whereClause)

  const data = await db
    .select()
    .from(salesReturns)
    .where(whereClause)
    .orderBy(desc(salesReturns.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { data, total: countRow?.cnt ?? 0 }
}
