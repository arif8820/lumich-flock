import { db } from '@/lib/db'
import { salesOrders, salesOrderItems, inventoryMovements, invoices, flocks, customers } from '@/lib/db/schema'
import { eq, and, desc, sql, count, getTableColumns } from 'drizzle-orm'
import type { SalesOrder, SalesOrderItem, NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'

export type SalesOrderWithCustomer = SalesOrder & { customerName: string | null }

export async function findSalesOrderById(id: string): Promise<SalesOrderWithCustomer | null> {
  const [row] = await db
    .select({ ...getTableColumns(salesOrders), customerName: customers.name })
    .from(salesOrders)
    .leftJoin(customers, eq(salesOrders.customerId, customers.id))
    .where(eq(salesOrders.id, id))
    .limit(1)
  return row ? (row as SalesOrderWithCustomer) : null
}

export async function findSalesOrderItems(orderId: string): Promise<SalesOrderItem[]> {
  return db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, orderId))
}

export async function countSalesOrdersThisMonth(prefix: string): Promise<number> {
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

export async function insertSalesOrderWithItems(
  order: NewSalesOrder,
  items: Omit<NewSalesOrderItem, 'orderId'>[]
): Promise<SalesOrder> {
  return db.transaction(async (tx) => {
    const [so] = await tx.insert(salesOrders).values(order).returning()
    if (items.length > 0) {
      await tx.insert(salesOrderItems).values(items.map(i => ({ ...i, orderId: so!.id })))
    }
    return so!
  })
}

export async function updateSalesOrderStatus(
  id: string,
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled',
  updatedBy: string
): Promise<void> {
  await db
    .update(salesOrders)
    .set({ status, updatedBy })
    .where(eq(salesOrders.id, id))
}

export async function deleteDraftSO(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(salesOrderItems).where(eq(salesOrderItems.orderId, id))
    await tx.delete(salesOrders).where(eq(salesOrders.id, id))
  })
}

export async function fulfillSOTx(
  orderId: string,
  userId: string,
  movements: NewInventoryMovement[],
  invoice: NewInvoice,
  flockUpdates: { flockId: string; retiredAt: Date }[]
): Promise<void> {
  await db.transaction(async (tx) => {
    const [so] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, orderId))
      .limit(1)

    if (!so) throw new Error('SO not found')
    if (so.status !== 'confirmed') throw new Error('Status SO tidak valid untuk operasi ini')

    // Check stock for each egg item movement
    for (const mv of movements) {
      if (mv.grade) {
        const [stockRow] = await tx
          .select({
            balance: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.movementType} = 'in' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END), 0)`,
          })
          .from(inventoryMovements)
          .where(eq(inventoryMovements.grade, mv.grade))

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

export async function getCustomerOutstandingCredit(customerId: string): Promise<number> {
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
  page: number = 1,
  pageSize: number = 20,
  status?: string
): Promise<{ data: SalesOrderWithCustomer[]; total: number }> {
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

  return { data: rows as SalesOrderWithCustomer[], total: countRow?.cnt ?? 0 }
}
