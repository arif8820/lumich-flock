import { db } from '@/lib/db'
import { salesReturns, salesReturnItems, inventoryMovements, invoices, customerCredits } from '@/lib/db/schema'
import { eq, desc, sql, count } from 'drizzle-orm'
import type { SalesReturn, SalesReturnItem, NewSalesReturn, NewSalesReturnItem, NewInventoryMovement, NewInvoice, NewCustomerCredit } from '@/lib/db/schema'

export async function findSalesReturnById(id: string): Promise<SalesReturn | null> {
  const [row] = await db.select().from(salesReturns).where(eq(salesReturns.id, id)).limit(1)
  return row ?? null
}

export async function findSalesReturnItems(returnId: string): Promise<SalesReturnItem[]> {
  return db.select().from(salesReturnItems).where(eq(salesReturnItems.returnId, returnId))
}

export async function countSalesReturnsThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ cnt: count() })
    .from(salesReturns)
    .where(sql`${salesReturns.returnNumber} LIKE ${pattern}`)
  return row?.cnt ?? 0
}

export async function insertSalesReturnWithItems(
  ret: NewSalesReturn,
  items: NewSalesReturnItem[]
): Promise<SalesReturn> {
  return db.transaction(async (tx) => {
    const [sr] = await tx.insert(salesReturns).values(ret).returning()
    if (items.length > 0) {
      await tx.insert(salesReturnItems).values(items.map(i => ({ ...i, returnId: sr!.id })))
    }
    return sr!
  })
}

export async function approveSalesReturnTx(
  returnId: string,
  userId: string,
  movements: NewInventoryMovement[],
  creditNoteInvoice: NewInvoice,
  customerCredit: NewCustomerCredit
): Promise<void> {
  await db.transaction(async (tx) => {
    // Lock return row
    const [sr] = await tx
      .select()
      .from(salesReturns)
      .where(eq(salesReturns.id, returnId))
      .limit(1)
      .for('update')

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
  returnId: string,
  userId: string
): Promise<void> {
  await db
    .update(salesReturns)
    .set({ status: 'rejected', reviewedBy: userId, reviewedAt: new Date() })
    .where(eq(salesReturns.id, returnId))
}

export async function listSalesReturns(
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<{ data: SalesReturn[]; total: number }> {
  const conditions = status ? eq(salesReturns.status, status as any) : undefined
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
