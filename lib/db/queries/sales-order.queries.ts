import { db } from '@/lib/db'
import { salesOrders, salesOrderItems, inventoryMovements, invoices, flocks } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import type { SalesOrder, SalesOrderItem, NewSalesOrder, NewSalesOrderItem, NewInventoryMovement, NewInvoice } from '@/lib/db/schema'

export async function findSalesOrderById(id: string): Promise<SalesOrder | null> {
  const [row] = await db.select().from(salesOrders).where(eq(salesOrders.id, id)).limit(1)
  return row ?? null
}

export async function findSalesOrderItems(orderId: string): Promise<SalesOrderItem[]> {
  return db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, orderId))
}

export async function countSalesOrdersThisMonth(prefix: string): Promise<number> {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const pattern = `${prefix}-${yearMonth}-%`
  const [row] = await db
    .select({ cnt: count() })
    .from(salesOrders)
    .where(sql`${salesOrders.orderNumber} LIKE ${pattern}`)
  return row?.cnt ?? 0
}

export async function insertSalesOrderWithItems(
  order: NewSalesOrder,
  items: NewSalesOrderItem[]
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
 {
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
  flockUpdates: { flockId: string; status: string; retiredAt: Date }[]
): Promise<void> {
  await db.transaction(async (tx) => {
    // Lock SO row
    const [so] = await tx
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, orderId))
      .limit(1)
      .for('update')

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
        .set({ status: fu.status, retiredAt: fu.retiredAt })
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
): Promise<{ data: SalesOrder[]; total: number }> {
  const conditions = status ? eq(salesOrders.status, status as any) : undefined
  const whereClause = conditions ?? sql`1=1`

  const [countRow] = await db
    .select({ cnt: count() })
    .from(salesOrders)
    .where(whereClause)

  const data = await db
    .select()
    .from(salesOrders)
    .where(whereClause)
    .orderBy(desc(salesOrders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { data, total: countRow?.cnt ?? 0 }
}
