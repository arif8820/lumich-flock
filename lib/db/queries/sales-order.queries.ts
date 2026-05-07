import { db } from '@/lib/db'
import { getFarmSchema } from '@/lib/db/schema-factory'
import { eq, and, desc, sql, count, getTableColumns } from 'drizzle-orm'

export async function findSalesOrderById(farmSchema: string, id: string) {
  const { salesOrders, customers } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({ ...getTableColumns(salesOrders), customerName: customers.name })
    .from(salesOrders)
    .leftJoin(customers, eq(salesOrders.customerId, customers.id))
    .where(eq(salesOrders.id, id))
    .limit(1)
  return row ?? null
}

export async function findSalesOrderItems(farmSchema: string, orderId: string) {
  const { salesOrderItems } = getFarmSchema(farmSchema)
  return db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, orderId))
}

export async function countSalesOrdersThisMonth(farmSchema: string, prefix: string): Promise<number> {
  const { salesOrders } = getFarmSchema(farmSchema)
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  // Use MAX on trailing seq to avoid collision when rows are deleted (COUNT would reuse numbers)
  const [row] = await db
    .select({ maxSeq: sql<string>`MAX(CAST(SPLIT_PART(${salesOrders.orderNumber}, '-', 3) AS INTEGER))` })
    .from(salesOrders)
    .where(sql`${salesOrders.orderNumber} LIKE ${pattern}`)
  return row?.maxSeq ? parseInt(row.maxSeq) : 0
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function insertSalesOrderWithItems(
  farmSchema: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
) {
  const { salesOrders, salesOrderItems } = getFarmSchema(farmSchema)
  return db.transaction(async (tx) => {
    const [so] = await tx.insert(salesOrders).values(order).returning()
    if (items.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await tx.insert(salesOrderItems).values(items.map((i: any) => ({ ...i, orderId: so!.id })))
    }
    return so!
  })
}

export async function updateSalesOrderStatus(
  farmSchema: string,
  id: string,
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled',
  updatedBy: string
): Promise<void> {
  const { salesOrders } = getFarmSchema(farmSchema)
  await db
    .update(salesOrders)
    .set({ status, updatedBy })
    .where(eq(salesOrders.id, id))
}

export async function deleteDraftSO(farmSchema: string, id: string): Promise<void> {
  const { salesOrders, salesOrderItems } = getFarmSchema(farmSchema)
  await db.transaction(async (tx) => {
    await tx.delete(salesOrderItems).where(eq(salesOrderItems.orderId, id))
    await tx.delete(salesOrders).where(eq(salesOrders.id, id))
  })
}

// any: dynamic farm schema — exact type from getFarmSchema not statically available at call site
export async function fulfillSOTx(
  farmSchema: string,
  orderId: string,
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  movements: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoice: any,
  flockUpdates: { flockId: string; retiredAt: Date }[]
): Promise<void> {
  const { salesOrders, salesOrderItems: _salesOrderItems, inventoryMovements, invoices, flocks } = getFarmSchema(farmSchema)
  await db.transaction(async (tx) => {
    const [so] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, orderId))
      .limit(1)

    if (!so) throw new Error('SO not found')
    if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')

    // Check stock for each movement that has a stockItemId
    for (const mv of movements) {
      if (mv.stockItemId) {
        const [stockRow] = await tx
          .select({
            balance: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END), 0)`,
          })
          .from(inventoryMovements)
          .where(eq(inventoryMovements.stockItemId, mv.stockItemId))

        const balance = Number(stockRow?.balance ?? 0)
        if (balance < (mv.quantity ?? 0)) {
          throw new Error('Stok tidak mencukupi saat transaksi diproses')
        }
      }
    }

    // Update SO status
    await tx
      .update(salesOrders)
      .set({ status: 'fulfilled', updatedBy: userId })
      .where(eq(salesOrders.id, orderId))

    // Insert inventory movements
    for (const mv of movements) {
      await tx.insert(inventoryMovements).values(mv)
    }

    // Insert invoice
    await tx.insert(invoices).values(invoice)

    // Update flock status for flock items
    for (const fu of flockUpdates) {
      await tx
        .update(flocks)
        .set({ retiredAt: fu.retiredAt })
        .where(eq(flocks.id, fu.flockId))
    }
  })
}

export async function getCustomerOutstandingCredit(farmSchema: string, customerId: string): Promise<number> {
  const { invoices } = getFarmSchema(farmSchema)
  const [row] = await db
    .select({
      outstanding: sql<number>`COALESCE(SUM(${invoices.totalAmount} - ${invoices.paidAmount}), 0)`,
    })
    .from(invoices)
    .where(and(
      eq(invoices.customerId, customerId),
      sql`${invoices.type} = 'sales_invoice'`,
      sql`${invoices.status} IN ('sent', 'partial', 'overdue')`
    ))
  return Number(row?.outstanding ?? 0)
}

export async function listSalesOrders(
  farmSchema: string,
  page: number = 1,
  pageSize: number = 20,
  status?: string
) {
  const { salesOrders, customers } = getFarmSchema(farmSchema)
  const conditions = status
    ? eq(salesOrders.status, status as 'draft' | 'confirmed' | 'fulfilled' | 'cancelled')
    : undefined
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(salesOrders)
    .where(whereClause)

  const rows = await db
    .select({ ...getTableColumns(salesOrders), customerName: customers.name })
    .from(salesOrders)
    .leftJoin(customers, eq(salesOrders.customerId, customers.id))
    .where(whereClause)
    .orderBy(desc(salesOrders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { data: rows as any[], total: countRow?.cnt ?? 0 }
}
